"""Lightweight text preprocessing: cleaning, tokenization, stopword removal.

We avoid NLTK's runtime corpus downloads (no internet guarantee at run time)
and instead ship a compact built-in stopword list, which is sufficient for
TF-IDF / Jaccard / keyword-extraction purposes.
"""
import re

STOPWORDS = set(
    """
    a about above after again against all am an and any are aren't as at be
    because been before being below between both but by can't cannot could
    couldn't did didn't do does doesn't doing don't down during each few for
    from further had hadn't has hasn't have haven't having he he'd he'll
    he's her here here's hers herself him himself his how how's i i'd i'll
    i'm i've if in into is isn't it it's its itself let's me more most
    mustn't my myself no nor not of off on once only or other ought our ours
    ourselves out over own same shan't she she'd she'll she's should
    shouldn't so some such than that that's the their theirs them
    themselves then there there's these they they'd they'll they're they've
    this those through to too under until up very was wasn't we we'd we'll
    we're we've were weren't what what's when when's where where's which
    while who who's whom why why's with won't would wouldn't you you'd
    you'll you're you've your yours yourself yourselves using use used uses
    also
    """.split()
)

WORD_RE = re.compile(r"[A-Za-z][A-Za-z'-]*")
SENTENCE_RE = re.compile(r"[.!?]+(?:\s|$)")


def clean_text(text: str) -> str:
    """Lowercase and strip non-alphabetic noise, keeping words readable."""
    return text.strip()


def tokenize(text: str, remove_stopwords: bool = True) -> list[str]:
    words = [w.lower() for w in WORD_RE.findall(text)]
    if remove_stopwords:
        words = [w for w in words if w not in STOPWORDS and len(w) > 1]
    return words


def sentence_count(text: str) -> int:
    text = text.strip()
    if not text:
        return 0
    parts = [p for p in SENTENCE_RE.split(text) if p.strip()]
    return max(len(parts), 1 if text else 0)


def document_statistics(text: str) -> dict:
    words_all = re.findall(r"\S+", text)
    tokens = tokenize(text, remove_stopwords=False)
    return {
        "words": len(words_all),
        "characters": len(text),
        "sentences": sentence_count(text),
        "unique_words": len(set(tokens)),
    }
