"""Common/unique keyword extraction and a lightweight topic heuristic.

Full topic modeling (LDA / NMF / BERTopic) is intentionally out of scope for
v1, as recommended: we use per-document top TF-IDF terms as a stand-in
"primary topic" signal, which is transparent and fast.
"""
from __future__ import annotations

from collections import Counter

from sklearn.feature_extraction.text import TfidfVectorizer

from .preprocessing import tokenize


def common_and_unique_keywords(text_a: str, text_b: str, top_n: int = 12):
    tokens_a = Counter(tokenize(text_a))
    tokens_b = Counter(tokenize(text_b))

    set_a, set_b = set(tokens_a), set(tokens_b)
    common = set_a & set_b
    only_a = set_a - set_b
    only_b = set_b - set_a

    def rank(counter: Counter, words: set[str], n: int) -> list[str]:
        return [w for w, _ in sorted(((w, counter[w]) for w in words), key=lambda x: -x[1])[:n]]

    common_ranked = rank(tokens_a + tokens_b, common, top_n)
    only_a_ranked = rank(tokens_a, only_a, top_n)
    only_b_ranked = rank(tokens_b, only_b, top_n)

    return {
        "common": common_ranked,
        "only_a": only_a_ranked,
        "only_b": only_b_ranked,
    }


def top_tfidf_terms(text: str, n: int = 3) -> list[str]:
    if not text.strip():
        return []
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=200)
        matrix = vectorizer.fit_transform([text])
    except ValueError:
        return []
    scores = matrix.toarray()[0]
    terms = vectorizer.get_feature_names_out()
    ranked = sorted(zip(terms, scores), key=lambda x: -x[1])
    return [t for t, s in ranked[:n] if s > 0]


def primary_topic(text: str) -> str:
    terms = top_tfidf_terms(text, n=2)
    if not terms:
        return "General"
    return " / ".join(t.title() for t in terms)


def topic_overlap(text_a: str, text_b: str, n: int = 8) -> float:
    terms_a = set(top_tfidf_terms(text_a, n))
    terms_b = set(top_tfidf_terms(text_b, n))
    if not terms_a and not terms_b:
        return 0.0
    union = terms_a | terms_b
    if not union:
        return 0.0
    return len(terms_a & terms_b) / len(union)


def highlight_shared_terms(text: str, shared_words: set[str]) -> list[dict]:
    """Split text into words, tagging which ones are in shared_words, for
    word-level highlighting on the frontend."""
    import re

    tokens = re.findall(r"[A-Za-z']+|[^A-Za-z']+", text)
    result = []
    for tok in tokens:
        clean = tok.lower().strip("'")
        result.append({"text": tok, "shared": clean in shared_words and clean.isalpha()})
    return result
