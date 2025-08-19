import os
import math
import joblib
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict
from db_connection import db
from regions.views import _normalize_region, STATES

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
RISK_MODEL_PATH = os.path.join(MODELS_DIR, 'scheme_risk_xgb.pkl')
SUCCESS_MODEL_PATH = os.path.join(MODELS_DIR, 'scheme_success_xgb.pkl')

_risk_model = None
_success_model = None


def _load_models():
    global _risk_model, _success_model
    if _risk_model is None and os.path.exists(RISK_MODEL_PATH):
        _risk_model = joblib.load(RISK_MODEL_PATH)
    if _success_model is None and os.path.exists(SUCCESS_MODEL_PATH):
        _success_model = joblib.load(SUCCESS_MODEL_PATH)


def _safe_days_since(ts, now_dt):
    try:
        if isinstance(ts, (int, float)):
            dt = datetime.utcfromtimestamp(ts/1000)
        else:
            dt = datetime.fromisoformat(str(ts))
        return max(0, (now_dt - dt).days)
    except Exception:
        return 999


def _build_features_per_scheme(now=None):
    """Compute per-scheme features aligned with training.
    Returns: (features_list, meta_list)
    meta: {scheme_id, name, region}
    """
    if now is None:
        now = datetime.utcnow()
    schemes = list(db['schemes'].find({}, {'_id':1,'name':1,'region':1,'created_at':1,'updated_at':1}))
    complaints = list(db['complaints'].find({}, {'scheme_id':1,'status':1,'created_at':1,'closed_at':1,'severity':1}))
    sentiments = list(db['sentiment_records'].find({}, {'region':1,'label':1,'created_at':1}))

    # Map
    by_scheme = defaultdict(list)
    for c in complaints:
        sid = str(c.get('scheme_id') or '')
        if sid:
            by_scheme[sid].append(c)

    sent_by_region = defaultdict(lambda: {'pos':0,'neg':0,'neu':0, 'pos_30':0, 'neg_30':0, 'tot_30':0})
    for s in sentiments:
        reg = _normalize_region(str(s.get('region') or ''))
        if reg not in STATES:
            continue
        lab = (s.get('label') or '').lower()
        if lab == 'positive':
            sent_by_region[reg]['pos'] += 1
        elif lab == 'negative':
            sent_by_region[reg]['neg'] += 1
        else:
            sent_by_region[reg]['neu'] += 1
        try:
            ts = s.get('created_at')
            if isinstance(ts, (int, float)):
                dt = datetime.utcfromtimestamp(ts/1000)
            else:
                dt = datetime.fromisoformat(str(ts))
            if (now - dt).days <= 30:
                sent_by_region[reg]['tot_30'] += 1
                if lab == 'positive':
                    sent_by_region[reg]['pos_30'] += 1
                elif lab == 'negative':
                    sent_by_region[reg]['neg_30'] += 1
        except Exception:
            pass

    feats = []
    meta = []
    for sc in schemes:
        sid = str(sc['_id'])
        region = _normalize_region(str(sc.get('region') or ''))
        region = region if region in STATES else 'Unknown'
        created_at = sc.get('created_at')
        updated_at = sc.get('updated_at')
        age_days = _safe_days_since(created_at, now)
        inact_days = _safe_days_since(updated_at or created_at, now)

        rows = by_scheme.get(sid, [])
        total = len(rows)
        closed = sum(1 for r in rows if (r.get('status') or '').lower() == 'closed')
        closure_rate = (closed/total) if total else 0.0
        close_times = []
        for r in rows:
            try:
                if r.get('closed_at') and r.get('created_at'):
                    ca = datetime.fromisoformat(str(r['created_at']))
                    cb = datetime.fromisoformat(str(r['closed_at']))
                    close_times.append((cb - ca).days)
            except Exception:
                pass
        avg_close_time = float(np.mean(close_times)) if close_times else 60.0

        # recent windows
        last30 = 0; last60 = 0
        last30_closed = 0
        for r in rows:
            try:
                ts = r.get('created_at')
                dt = datetime.fromisoformat(str(ts))
                d = (now - dt).days
                if d <= 30:
                    last30 += 1
                    if (r.get('status') or '').lower() == 'closed':
                        last30_closed += 1
                if d <= 60:
                    last60 += 1
            except Exception:
                pass
        velocity = (last30 - max(0, last60 - last30))
        recent_closure_rate = (last30_closed/last30) if last30 else 0.0

        # region sentiment
        sreg = sent_by_region.get(region, {})
        pos = sreg.get('pos', 0); neg = sreg.get('neg', 0); neu = sreg.get('neu', 0)
        tot = pos + neg + neu
        reg_pos_ratio = (pos / tot) if tot else 0.5
        r30 = sreg.get('tot_30', 0)
        reg_pos_ratio_30 = (sreg.get('pos_30',0)/r30) if r30 else reg_pos_ratio
        reg_neg_ratio_30 = (sreg.get('neg_30',0)/r30) if r30 else (neg / tot if tot else 0.2)

        # geo diversity (here 1 region only per scheme in synthetic; keep feature for future)
        geo_div = 1

        feat = [
            age_days, inact_days, total, closed, closure_rate, avg_close_time,
            last30, last60, velocity, recent_closure_rate,
            reg_pos_ratio, reg_pos_ratio_30, reg_neg_ratio_30, geo_div
        ]
        feats.append(feat)
        meta.append({'scheme_id': sid, 'name': sc.get('name') or 'Scheme', 'region': region})

    return np.array(feats, dtype=float), meta


def predict_risk_for_schemes():
    _load_models()
    feats, meta = _build_features_per_scheme()
    out = []
    if _risk_model is None or feats.size == 0:
        return []
    # XGB outputs probability if configured; else use predict_proba if available
    if hasattr(_risk_model, 'predict_proba'):
        probs = _risk_model.predict_proba(feats)
        # assume class 1 is high risk
        p = probs[:, 1]
    else:
        p = _risk_model.predict(feats)
    for m, prob in zip(meta, p):
        out.append({
            'scheme_id': m['scheme_id'],
            'name': m['name'],
            'region': m['region'],
            'risk_prob': float(prob),
        })
    # convert to 0-100 risk score
    out.sort(key=lambda x: x['risk_prob'], reverse=True)
    for row in out:
        row['risk'] = int(round(row['risk_prob'] * 100))
    return out


def predict_success_for_schemes():
    _load_models()
    feats, meta = _build_features_per_scheme()
    out = []
    if _success_model is None or feats.size == 0:
        return []
    if hasattr(_success_model, 'predict_proba'):
        probs = _success_model.predict_proba(feats)
        p = probs[:, 1]
    else:
        p = _success_model.predict(feats)
    for m, prob in zip(meta, p):
        out.append({
            'scheme_id': m['scheme_id'],
            'name': m['name'],
            'region': m['region'],
            'success_probability': float(prob),
        })
    out.sort(key=lambda x: x['success_probability'], reverse=True)
    return out
