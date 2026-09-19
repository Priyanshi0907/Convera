"""Similarity computation: Cosine (TF-IDF), Jaccard, and Semantic (embeddings).

Semantic similarity uses sentence-transformers (all-MiniLM-L6-v2). The model
is loaded lazily and cached in-process; if it cannot be loaded (e.g. no
internet on very first run to fetch weights), we fall back gracefully and
surface that clearly to the caller rather than crashing the whole analysis.
"""
from __future__ import annotations

import threading

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine

from .preprocessing import tokenize

_model = None
_model_lock = threading.Lock()
_model_load_failed = False


def _get_semantic_model():
    global _model, _model_load_failed
    if _model is not None or _model_load_failed:
        return _model
    with _model_lock:
        if _model is not None or _model_load_failed:
            return _model
        try:
            from sentence_transformers import SentenceTransformer

            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:  # noqa: BLE001
            _model_load_failed = True
            _model = None
    return _model


def cosine_tfidf_similarity(text_a: str, text_b: str) -> float:
    """TF-IDF vectorize both docs jointly, then cosine similarity."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        matrix = vectorizer.fit_transform([text_a, text_b])
    except ValueError:
        # Happens if vocabulary is empty after stopword removal
        return 0.0
    score = sk_cosine(matrix[0:1], matrix[1:2])[0][0]
    return float(max(0.0, min(1.0, score)))


def jaccard_similarity(text_a: str, text_b: str) -> float:
    set_a = set(tokenize(text_a))
    set_b = set(tokenize(text_b))
    if not set_a and not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    if not union:
        return 0.0
    return len(intersection) / len(union)


def semantic_similarity(text_a: str, text_b: str) -> tuple[float, bool]:
    """Returns (score, available). available=False if model couldn't load."""
    model = _get_semantic_model()
    if model is None:
        return 0.0, False
    if not text_a.strip() or not text_b.strip():
        return 0.0, True
    embeddings = model.encode([text_a, text_b])
    score = sk_cosine([embeddings[0]], [embeddings[1]])[0][0]
    return float(max(0.0, min(1.0, score))), True


def categorize(score: float) -> str:
    pct = score * 100
    if pct >= 80:
        return "Very Similar"
    if pct >= 60:
        return "Similar"
    if pct >= 40:
        return "Moderately Similar"
    if pct >= 20:
        return "Slightly Similar"
    return "Very Different"


def overall_score(cosine: float, jaccard: float, semantic: float, semantic_available: bool) -> float:
    """Weighted blend emphasizing semantic embeddings when available, supported by lexical checks."""
    if semantic_available:
        return cosine * 0.12 + jaccard * 0.08 + semantic * 0.80
    return cosine * 0.65 + jaccard * 0.35

