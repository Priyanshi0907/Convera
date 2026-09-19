from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class TextPair(BaseModel):
    text_a: str
    text_b: str
    name_a: Optional[str] = "Document A"
    name_b: Optional[str] = "Document B"
    save: Optional[bool] = True


class AnalysisResult(BaseModel):
    id: Optional[int] = None
    doc_a_name: str
    doc_b_name: str
    cosine_similarity: float
    jaccard_similarity: float
    semantic_similarity: float
    semantic_available: bool
    overall_score: float
    category: str
    common_keywords: list[str]
    unique_a: list[str]
    unique_b: list[str]
    topic_a: str
    topic_b: str
    topic_overlap: float
    stats_a: dict
    stats_b: dict
    highlighted_a: list[dict]
    highlighted_b: list[dict]
    created_at: Optional[str] = None


class MultiDocItem(BaseModel):
    name: str
    text: str


class MultiDocAnalyzeRequest(BaseModel):
    documents: list[MultiDocItem]
    save: Optional[bool] = True
    title: Optional[str] = None


class MultiDocPairResult(BaseModel):
    a: str
    b: str
    score: float
    category: Optional[str] = None


class MultiDocPairDetail(BaseModel):
    index_a: int
    index_b: int
    a: str
    b: str
    overall_score: float
    cosine_similarity: float
    jaccard_similarity: float
    semantic_similarity: float
    semantic_available: bool
    category: str
    common_keywords: list[str] = []
    stats_a: dict = {}
    stats_b: dict = {}


class MultiDocAnalyzeResponse(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    names: list[str]
    matrix: list[list[float]]
    most_similar: Optional[MultiDocPairResult] = None
    least_similar: Optional[MultiDocPairResult] = None
    average_similarity: Optional[float] = 0.0
    pairs: list[MultiDocPairDetail] = []
    corpus_keywords: list[str] = []
    created_at: Optional[str] = None


