import os
import json
import csv
import sys
from pathlib import Path
import joblib
import numpy as np
from datetime import datetime
from collections import defaultdict

# Ensure parent directory is on sys.path so 'db_connection' is importable when run as a script
PARENT_DIR = str(Path(__file__).resolve().parents[1])
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

try:
    from xgboost import XGBClassifier
except Exception:
    XGBClassifier = None

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import roc_auc_score

from db_connection import db
# Support both package and script execution contexts
try:
    from ml.infer_schemes import _build_features_per_scheme
except Exception:  # fallback when __package__ is None
    from infer_schemes import _build_features_per_scheme

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
RISK_MODEL_PATH = os.path.join(MODELS_DIR, 'scheme_risk_xgb.pkl')
SUCCESS_MODEL_PATH = os.path.join(MODELS_DIR, 'scheme_success_xgb.pkl')
SCHEMA_PATH = os.path.join(MODELS_DIR, 'feature_schema.json')

os.makedirs(MODELS_DIR, exist_ok=True)


def _build_training_labels(now=None):
    """Create labels for risk (future 30d spike) and success (closure performance next 60d).
    Returns: y_risk, y_success aligned with features from _build_features_per_scheme().
    """
    if now is None:
        now = datetime.utcnow()
    schemes = list(db['schemes'].find({}, {'_id':1,'created_at':1}))
    complaints = list(db['complaints'].find({}, {'scheme_id':1,'status':1,'created_at':1,'closed_at':1}))

    by_scheme = defaultdict(list)
    for c in complaints:
        sid = str(c.get('scheme_id') or '')
        if sid:
            by_scheme[sid].append(c)

    # Risk label: top decile of next 30d complaints compared to prior 60d baseline
    # Success label: future 60d closure rate >= 0.7 and avg close time <= 21 days
    y_risk = []
    y_succ = []

    # compute scheme-specific metrics
    for sc in schemes:
        sid = str(sc['_id'])
        rows = by_scheme.get(sid, [])
        next30 = 0
        base60 = 0
        succ_total = 0
        succ_closed = 0
        close_times = []
        for r in rows:
            try:
                c_at = datetime.fromisoformat(str(r.get('created_at')))
                d = (now - c_at).days
                if 0 <= d <= 30:
                    next30 += 1
                if 30 < d <= 90:
                    base60 += 1
                if 0 <= d <= 60:
                    succ_total += 1
                    if (r.get('status') or '').lower() == 'closed':
                        succ_closed += 1
                        if r.get('closed_at'):
                            cb = datetime.fromisoformat(str(r['closed_at']))
                            close_times.append((cb - c_at).days)
            except Exception:
                pass
        # Risk score baseline
        label_risk = 1 if (next30 >= max(5, 2 * max(1, base60 // 3))) else 0
        # Success label
        closure_rate = (succ_closed / succ_total) if succ_total else 0.0
        avg_close = float(np.mean(close_times)) if close_times else 99.0
        label_succ = 1 if (closure_rate >= 0.7 and avg_close <= 21.0) else 0
        y_risk.append(label_risk)
        y_succ.append(label_succ)

    return np.array(y_risk, dtype=int), np.array(y_succ, dtype=int)


# -------------------- CSV-based pipeline --------------------
def _parse_dt(val):
    try:
        return datetime.fromisoformat(str(val))
    except Exception:
        return None


def _load_csv_rows(path):
    rows = []
    with open(path, 'r', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            rows.append(row)
    return rows


def _build_features_per_scheme_from_csv(data_dir, now=None):
    if now is None:
        now = datetime.utcnow()
    schemes_csv = os.path.join(data_dir, 'schemes.csv')
    complaints_csv = os.path.join(data_dir, 'complaints.csv')
    sentiments_csv = os.path.join(data_dir, 'sentiments.csv')

    schemes = _load_csv_rows(schemes_csv)
    complaints = _load_csv_rows(complaints_csv)
    sentiments = _load_csv_rows(sentiments_csv)

    # Indexing
    by_scheme = defaultdict(list)
    for c in complaints:
        sid = c.get('scheme_id') or ''
        if sid:
            by_scheme[sid].append(c)

    sent_by_region = defaultdict(lambda: {'pos':0,'neg':0,'neu':0, 'pos_30':0, 'neg_30':0, 'tot_30':0})
    for s in sentiments:
        reg = s.get('region') or 'Unknown'
        lab = (s.get('label') or '').lower()
        if lab == 'positive':
            sent_by_region[reg]['pos'] += 1
        elif lab == 'negative':
            sent_by_region[reg]['neg'] += 1
        else:
            sent_by_region[reg]['neu'] += 1
        dt = _parse_dt(s.get('created_at'))
        if dt is not None and (now - dt).days <= 30:
            sent_by_region[reg]['tot_30'] += 1
            if lab == 'positive':
                sent_by_region[reg]['pos_30'] += 1
            elif lab == 'negative':
                sent_by_region[reg]['neg_30'] += 1

    feats = []
    meta = []
    for sc in schemes:
        sid = sc.get('scheme_id')
        region = sc.get('region') or 'Unknown'
        created_at = _parse_dt(sc.get('created_at'))
        updated_at = _parse_dt(sc.get('updated_at')) or created_at
        age_days = (now - created_at).days if created_at else 0
        inact_days = (now - updated_at).days if updated_at else age_days

        rows = by_scheme.get(sid, [])
        total = len(rows)
        closed = sum(1 for r in rows if (r.get('status') or '').lower() == 'closed')
        closure_rate = (closed/total) if total else 0.0
        close_times = []
        for r in rows:
            ca = _parse_dt(r.get('created_at'))
            cb = _parse_dt(r.get('closed_at'))
            if ca and cb:
                close_times.append((cb - ca).days)
        avg_close_time = float(np.mean(close_times)) if close_times else 60.0

        # recent windows
        last30 = 0; last60 = 0; last30_closed = 0
        for r in rows:
            dt = _parse_dt(r.get('created_at'))
            if dt is None:
                continue
            d = (now - dt).days
            if d <= 30:
                last30 += 1
                if (r.get('status') or '').lower() == 'closed':
                    last30_closed += 1
            if d <= 60:
                last60 += 1
        velocity = (last30 - max(0, last60 - last30))
        recent_closure_rate = (last30_closed/last30) if last30 else 0.0

        sreg = sent_by_region.get(region, {})
        pos = sreg.get('pos', 0); neg = sreg.get('neg', 0); neu = sreg.get('neu', 0)
        tot = pos + neg + neu
        reg_pos_ratio = (pos / tot) if tot else 0.5
        r30 = sreg.get('tot_30', 0)
        reg_pos_ratio_30 = (sreg.get('pos_30',0)/r30) if r30 else reg_pos_ratio
        reg_neg_ratio_30 = (sreg.get('neg_30',0)/r30) if r30 else (neg / tot if tot else 0.2)

        geo_div = 1

        feat = [
            age_days, inact_days, total, closed, closure_rate, avg_close_time,
            last30, last60, velocity, recent_closure_rate,
            reg_pos_ratio, reg_pos_ratio_30, reg_neg_ratio_30, geo_div
        ]
        feats.append(feat)
        meta.append({'scheme_id': sid, 'name': sc.get('name') or 'Scheme', 'region': region})

    return np.array(feats, dtype=float), meta


def _build_training_labels_from_csv(data_dir, now=None):
    if now is None:
        now = datetime.utcnow()
    schemes_csv = os.path.join(data_dir, 'schemes.csv')
    complaints_csv = os.path.join(data_dir, 'complaints.csv')
    schemes = _load_csv_rows(schemes_csv)
    complaints = _load_csv_rows(complaints_csv)

    by_scheme = defaultdict(list)
    for c in complaints:
        sid = c.get('scheme_id') or ''
        if sid:
            by_scheme[sid].append(c)

    y_risk = []
    y_succ = []
    for sc in schemes:
        sid = sc.get('scheme_id')
        rows = by_scheme.get(sid, [])
        next30 = 0
        base60 = 0
        succ_total = 0
        succ_closed = 0
        close_times = []
        for r in rows:
            c_at = _parse_dt(r.get('created_at'))
            if not c_at:
                continue
            d = (now - c_at).days
            if 0 <= d <= 30:
                next30 += 1
            if 30 < d <= 90:
                base60 += 1
            if 0 <= d <= 60:
                succ_total += 1
                if (r.get('status') or '').lower() == 'closed':
                    succ_closed += 1
                    cb = _parse_dt(r.get('closed_at'))
                    if cb:
                        close_times.append((cb - c_at).days)
        label_risk = 1 if (next30 >= max(5, 2 * max(1, base60 // 3))) else 0
        closure_rate = (succ_closed / succ_total) if succ_total else 0.0
        avg_close = float(np.mean(close_times)) if close_times else 99.0
        label_succ = 1 if (closure_rate >= 0.7 and avg_close <= 21.0) else 0
        y_risk.append(label_risk)
        y_succ.append(label_succ)

    return np.array(y_risk, dtype=int), np.array(y_succ, dtype=int)


def _train_classifier(X, y):
    # TimeSeriesSplit as a proxy; features are scheme-level static snapshots
    splitter = TimeSeriesSplit(n_splits=5)
    best_auc = -1
    best_model = None

    # Candidate model A: XGBoost
    if XGBClassifier is not None:
        model = XGBClassifier(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='binary:logistic',
            eval_metric='logloss',
            n_jobs=4,
            tree_method='hist'
        )
        try:
            aucs = []
            for train_idx, test_idx in splitter.split(X):
                model.fit(X[train_idx], y[train_idx])
                proba = model.predict_proba(X[test_idx])[:,1]
                aucs.append(roc_auc_score(y[test_idx], proba))
            mean_auc = float(np.mean(aucs)) if aucs else 0.0
            best_auc = mean_auc
            best_model = model
        except Exception:
            pass

    # Candidate model B: GradientBoosting with calibration
    if best_model is None:
        base = GradientBoostingClassifier(n_estimators=300, max_depth=3)
        model = CalibratedClassifierCV(base, method='isotonic', cv=3)
        aucs = []
        for train_idx, test_idx in splitter.split(X):
            model.fit(X[train_idx], y[train_idx])
            proba = model.predict_proba(X[test_idx])[:,1]
            aucs.append(roc_auc_score(y[test_idx], proba))
        mean_auc = float(np.mean(aucs)) if aucs else 0.0
        if mean_auc > best_auc:
            best_auc = mean_auc
            best_model = model

    return best_model, best_auc


def train_and_save(data_dir: str | None = None):
    if data_dir:
        X, meta = _build_features_per_scheme_from_csv(data_dir)
        y_risk, y_succ = _build_training_labels_from_csv(data_dir)
    else:
        X, meta = _build_features_per_scheme()
        y_risk, y_succ = _build_training_labels()
    if X.size == 0:
        raise RuntimeError('No features found to train on')
    if len(y_risk) != len(X) or len(y_succ) != len(X):
        # Align by count: build_features reads current schemes; labels built in same order
        n = min(len(X), len(y_risk), len(y_succ))
        X = X[:n]
        y_risk = y_risk[:n]
        y_succ = y_succ[:n]

    risk_model, risk_auc = _train_classifier(X, y_risk)
    succ_model, succ_auc = _train_classifier(X, y_succ)

    joblib.dump(risk_model, RISK_MODEL_PATH)
    joblib.dump(succ_model, SUCCESS_MODEL_PATH)

    schema = {
        'feature_order': [
            'age_days','inact_days','total','closed','closure_rate','avg_close_time',
            'last30','last60','velocity','recent_closure_rate',
            'reg_pos_ratio','reg_pos_ratio_30','reg_neg_ratio_30','geo_div'
        ],
        'metrics': {'risk_auc': risk_auc, 'success_auc': succ_auc}
    }
    with open(SCHEMA_PATH, 'w', encoding='utf-8') as f:
        json.dump(schema, f, indent=2)

    return {'risk_auc': risk_auc, 'success_auc': succ_auc, 'paths': {
        'risk_model': RISK_MODEL_PATH,
        'success_model': SUCCESS_MODEL_PATH,
        'schema': SCHEMA_PATH,
    }}


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--data-dir', type=str, default=None, help='Directory containing schemes.csv, complaints.csv, sentiments.csv')
    args = ap.parse_args()
    out = train_and_save(args.data_dir)
    print(out)
