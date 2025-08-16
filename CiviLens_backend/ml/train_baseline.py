import os
import json
import pickle
from datetime import datetime
from typing import List, Dict, Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from scipy.sparse import hstack, csr_matrix
import numpy as np

from .feature_builder import extract_meta_features, prepare_text

ART_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')
VEC_PATH = os.path.join(ART_DIR, 'vectorizer.pkl')
MODEL_PATH = os.path.join(ART_DIR, 'model.pkl')
META_PATH = os.path.join(ART_DIR, 'feature_meta.json')


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def _collect_samples(mongo_db) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    # From training_samples collection
    if 'training_samples' in mongo_db.list_collection_names():
        for s in mongo_db['training_samples'].find({ 'label': { '$in': ['legit', 'scam'] } }):
            items.append({
                'title': s.get('title') or '',
                'description': s.get('text') or s.get('description') or '',
                'source_url': s.get('meta', {}).get('source_url') or s.get('source_url') or '',
                'label': 1 if s.get('label') in ('scam', 'suspicious') else 0,
            })
    # From schemes manual labels (admin overrides)
    if 'schemes' in mongo_db.list_collection_names():
        cur = mongo_db['schemes'].find({ 'verification.manual_label': { '$in': ['legit', 'suspicious', 'scam'] } })
        for s in cur:
            ml = (s.get('verification') or {}).get('manual_label')
            items.append({
                'title': s.get('title') or '',
                'description': s.get('description') or s.get('summary') or '',
                'source_url': s.get('source_url') or '',
                'label': 1 if ml in ('scam', 'suspicious') else 0,
            })
    return items


def train_from_db(mongo_db) -> Dict[str, Any]:
    data = _collect_samples(mongo_db)
    if len(data) < 50:
        raise ValueError('Not enough labeled data to train (need >= 50). Found %d' % len(data))

    texts = [prepare_text(s) for s in data]
    y = np.array([s['label'] for s in data], dtype=np.int32)

    vec = TfidfVectorizer(ngram_range=(1,2), min_df=2, max_features=50000)
    X_text = vec.fit_transform(texts)

    # Meta features (raw, no scaler; keep consistent order via meta_keys)
    meta_list = [extract_meta_features(texts[i], data[i]['source_url']) for i in range(len(data))]
    meta_keys = list(meta_list[0].keys())
    X_meta = np.array([[m[k] for k in meta_keys] for m in meta_list], dtype=np.float32)
    # Convert to sparse for efficient hstack
    X_meta_sparse = csr_matrix(X_meta)

    X = hstack([X_text, X_meta_sparse])

    # Simple logistic regression
    clf = LogisticRegression(max_iter=200, n_jobs=None)
    clf.fit(X, y)

    _ensure_dir(ART_DIR)
    with open(VEC_PATH, 'wb') as f:
        pickle.dump(vec, f)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)
    with open(META_PATH, 'w', encoding='utf-8') as f:
        json.dump({
            'meta_keys': meta_keys,
            'trained_at': datetime.utcnow().isoformat(),
            'samples': len(data)
        }, f)

    return { 'samples': len(data), 'vectorizer': VEC_PATH, 'model': MODEL_PATH }
