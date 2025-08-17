from typing import List, Tuple, Optional

# Optional deps: sentence-transformers (preferred), transformers (fallback).
try:
    from transformers import pipeline  # type: ignore
except Exception:  # pragma: no cover
    pipeline = None  # type: ignore

try:
    from sentence_transformers import SentenceTransformer, util  # type: ignore
except Exception:  # pragma: no cover
    SentenceTransformer = None  # type: ignore
    util = None  # type: ignore


_st_model = None  # cached sentence-transformers model


def get_st_model():
    """Load sentence-transformers model 'sentence-transformers/all-MiniLM-L6-v2' if available."""
    global _st_model
    if _st_model is not None:
        return _st_model
    if SentenceTransformer is None:
        return None
    try:
        _st_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        return _st_model
    except Exception:
        return None


def get_sentiment_pipeline():
    """
    Try to create a multilingual sentiment pipeline. Returns None if transformers
    is not installed or model cannot be loaded.
    Models tried (in order):
    - cardiffnlp/twitter-xlm-roberta-base-sentiment
    - distilbert-base-multilingual-cased
    - distilbert-base-uncased-finetuned-sst-2-english (English only)
    """
    if pipeline is None:
        return None
    model_candidates = [
        # widely used multilingual sentiment
        ("sentiment-analysis", "cardiffnlp/twitter-xlm-roberta-base-sentiment"),
        # generic multilingual cased (may fall back to POSITIVE/NEGATIVE labels)
        ("sentiment-analysis", "distilbert-base-multilingual-cased"),
        # English fallback
        ("sentiment-analysis", "distilbert-base-uncased-finetuned-sst-2-english"),
    ]
    for task, model in model_candidates:
        try:
            return pipeline(task, model=model)
        except Exception:
            continue
    # Final fallback: let transformers select default for task
    try:
        return pipeline("sentiment-analysis")
    except Exception:
        return None


def map_label_to_triple(label: str, score: float | None = None) -> str:
    """Map diverse model labels to 'positive'|'neutral'|'negative'.

    Handles common cases:
    - 'positive'/'negative'/'neutral'
    - 'LABEL_0'/'LABEL_1'/'LABEL_2' (assumed negative/neutral/positive)
    - Binary models ('POSITIVE'/'NEGATIVE') with optional score threshold for neutral.
    """
    l = (label or "").lower()
    # Direct matches
    if "positive" in l or l in {"pos", "+"}:
        return "positive"
    if "negative" in l or l in {"neg", "-"}:
        return "negative"
    if "neutral" in l:
        return "neutral"

    # CardiffNLP style
    if l in {"label_0", "0"}:
        return "negative"
    if l in {"label_1", "1"}:
        return "neutral"
    if l in {"label_2", "2"}:
        return "positive"

    # Binary models: use threshold to map low-confidence to neutral
    if "positive" in l or "negative" in l:
        if score is not None and score < 0.6:
            return "neutral"
        return "positive" if "positive" in l else "negative"

    # Fallback
    return "neutral"


def analyze_sentiments(texts: List[str]) -> Optional[List[str]]:
    """
    Run sentence-transformers prototype similarity if available.
    Otherwise run transformers sentiment pipeline.
    Returns list of 'positive'/'neutral'/'negative' or None if not available.
    """
    # Preferred: sentence-transformers zero-shot via prototype similarity
    st = get_st_model()
    if st is not None and util is not None:
        try:
            # Prototypical sentences for each class
            protos = {
                'positive': [
                    "I am satisfied and happy with this.",
                    "This experience was good and helpful.",
                ],
                'neutral': [
                    "This is an objective statement without strong emotion.",
                    "The message is informational and balanced.",
                ],
                'negative': [
                    "I am dissatisfied and unhappy with this.",
                    "This experience was bad and problematic.",
                ],
            }
            # Pre-embed prototypes
            proto_texts: List[Tuple[str, str]] = []  # (label, text)
            for lab, lst in protos.items():
                for p in lst:
                    proto_texts.append((lab, p))
            proto_emb = st.encode([p for (_lab, p) in proto_texts], convert_to_tensor=True, show_progress_bar=False)
            out: List[str] = []
            chunk = 64
            for i in range(0, len(texts), chunk):
                batch = texts[i:i+chunk]
                emb = st.encode(batch, convert_to_tensor=True, show_progress_bar=False)
                # cosine similarities to each prototype
                sim = util.cos_sim(emb, proto_emb)  # [batch, num_protos]
                for row in sim:
                    # aggregate by label (max over prototypes of that label)
                    best_label = 'neutral'
                    best_score = -1.0
                    idx = 0
                    for lab, _p in proto_texts:
                        score = float(row[idx])
                        if score > best_score:
                            best_score = score
                            best_label = lab
                        idx += 1
                    out.append(best_label)
            return out
        except Exception:
            pass

    # Fallback: transformers pipeline
    sp = get_sentiment_pipeline()
    if sp is None:
        return None
    try:
        out2: List[str] = []
        chunk = 64
        for i in range(0, len(texts), chunk):
            batch = texts[i:i+chunk]
            preds = sp(batch, truncation=True)
            for p in preds:
                label = str(p.get("label"))
                score = float(p.get("score", 1.0)) if isinstance(p, dict) else None
                out2.append(map_label_to_triple(label, score))
        return out2
    except Exception:
        return None


def top_tfidf_keywords(texts: List[str], top_k: int = 20) -> List[Tuple[str, float]]:
    """
    Extract top keywords using TF-IDF across the provided texts.
    Returns list of (term, score) sorted by descending score.
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
    except Exception:
        return []
    if not texts:
        return []
    try:
        # Basic vectorizer; can be extended with custom analyzers for non-English
        vect = TfidfVectorizer(
            max_df=0.95,
            min_df=1,
            ngram_range=(1, 2),
            stop_words='english',
        )
        X = vect.fit_transform(texts)
        # Average tf-idf over documents
        scores = X.mean(axis=0).A1
        terms = vect.get_feature_names_out()
        pairs = list(zip(terms, scores))
        pairs.sort(key=lambda x: x[1], reverse=True)
        return pairs[:top_k]
    except Exception:
        return []
