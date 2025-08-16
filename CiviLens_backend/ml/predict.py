import os
import json
import pickle
from typing import Dict, Any
from scipy.sparse import hstack, csr_matrix
import numpy as np
from .feature_builder import extract_meta_features, prepare_text

ART_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')
VEC_PATH = os.path.join(ART_DIR, 'vectorizer.pkl')
MODEL_PATH = os.path.join(ART_DIR, 'model.pkl')
META_PATH = os.path.join(ART_DIR, 'feature_meta.json')


def _load_artifacts():
    if not (os.path.exists(VEC_PATH) and os.path.exists(MODEL_PATH)):
        return None, None, None
    with open(VEC_PATH, 'rb') as f:
        vec = pickle.load(f)
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    meta = {}
    if os.path.exists(META_PATH):
        with open(META_PATH, 'r', encoding='utf-8') as f:
            meta = json.load(f)
    return vec, model, meta


VEC, MODEL, META = _load_artifacts()


def available() -> bool:
    return VEC is not None and MODEL is not None


def predict_verification(sample: Dict[str, Any]) -> Dict[str, Any]:
    """Return {'prob': float, 'risk_score': int, 'label': str, 'top_terms': list}.
    Falls back to neutral if artifacts missing.
    """
    if not available():
        return {"prob": 0.0, "risk_score": 0, "label": "legit", "top_terms": []}

    text = prepare_text(sample)
    X_text = VEC.transform([text])

    # Build meta features in the same order as training
    X = X_text
    meta_keys = (META or {}).get('meta_keys')
    if meta_keys:
        feats = extract_meta_features(text, sample.get('source_url') or '')
        meta_vec = np.array([[float(feats.get(k, 0.0)) for k in meta_keys]], dtype=np.float32)
        X_meta = csr_matrix(meta_vec)
        X = hstack([X_text, X_meta])

    # Probability of class 1 = scam/suspicious
    if hasattr(MODEL, 'predict_proba'):
        prob = float(MODEL.predict_proba(X)[0, 1])
    else:
        # Decision function -> sigmoid approximation
        d = float(MODEL.decision_function(X)[0])
        prob = float(1.0 / (1.0 + np.exp(-d)))

    risk = int(round(prob * 100))
    label = 'suspicious' if risk >= 50 else 'legit'

    # Explain top weighted terms (if linear model)
    top_terms = []
    try:
        coef = MODEL.coef_[0]
        if hasattr(VEC, 'get_feature_names_out'):
            names = VEC.get_feature_names_out()
        else:
            names = VEC.get_feature_names()
        # Get active terms
        idx = X_text.nonzero()[1]
        term_weights = [(names[i], float(coef[i])) for i in idx]
        # Top positive contributors toward suspicious
        term_weights.sort(key=lambda x: x[1], reverse=True)
        top_terms = term_weights[:5]
    except Exception:
        top_terms = []

    return {"prob": prob, "risk_score": risk, "label": label, "top_terms": top_terms}
