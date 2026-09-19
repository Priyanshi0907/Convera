from __future__ import annotations

from collections import Counter
import datetime
import itertools

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
from sqlalchemy.orm import Session

from .. import keywords as kw
from .. import similarity as sim
from ..database import Analysis, Comparison, get_db
from ..preprocessing import document_statistics, tokenize
from ..schemas import (AnalysisResult, MultiDocAnalyzeRequest,
                        MultiDocAnalyzeResponse, MultiDocPairDetail, MultiDocPairResult, TextPair)
from ..text_extraction import extract_text_from_upload

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


def _build_analysis(text_a: str, text_b: str, name_a: str, name_b: str) -> dict:
    cosine = sim.cosine_tfidf_similarity(text_a, text_b)
    jaccard = sim.jaccard_similarity(text_a, text_b)
    semantic, semantic_available = sim.semantic_similarity(text_a, text_b)
    overall = sim.overall_score(cosine, jaccard, semantic, semantic_available)
    category = sim.categorize(overall)

    kw_result = kw.common_and_unique_keywords(text_a, text_b)
    topic_a = kw.primary_topic(text_a)
    topic_b = kw.primary_topic(text_b)
    overlap = kw.topic_overlap(text_a, text_b)

    stats_a = document_statistics(text_a)
    stats_b = document_statistics(text_b)

    shared_set = set(kw_result["common"])
    highlighted_a = kw.highlight_shared_terms(text_a, shared_set)
    highlighted_b = kw.highlight_shared_terms(text_b, shared_set)

    return {
        "doc_a_name": name_a,
        "doc_b_name": name_b,
        "cosine_similarity": round(cosine, 4),
        "jaccard_similarity": round(jaccard, 4),
        "semantic_similarity": round(semantic, 4),
        "semantic_available": semantic_available,
        "overall_score": round(overall, 4),
        "category": category,
        "common_keywords": kw_result["common"],
        "unique_a": kw_result["only_a"],
        "unique_b": kw_result["only_b"],
        "topic_a": topic_a,
        "topic_b": topic_b,
        "topic_overlap": round(overlap, 4),
        "stats_a": stats_a,
        "stats_b": stats_b,
        "highlighted_a": highlighted_a,
        "highlighted_b": highlighted_b,
    }


def _persist(db: Session, result: dict, file_type: str = "Text") -> Analysis:
    row = Analysis(
        doc_a_name=result["doc_a_name"],
        doc_b_name=result["doc_b_name"],
        cosine_similarity=result["cosine_similarity"],
        jaccard_similarity=result["jaccard_similarity"],
        semantic_similarity=result["semantic_similarity"],
        overall_score=result["overall_score"],
        category=result["category"],
        common_keywords=",".join(result["common_keywords"]),
        unique_a=",".join(result["unique_a"]),
        unique_b=",".join(result["unique_b"]),
        topic_a=result["topic_a"],
        topic_b=result["topic_b"],
        topic_overlap=result["topic_overlap"],
        file_type=file_type,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.post("/text", response_model=AnalysisResult)
def analyze_text(payload: TextPair, db: Session = Depends(get_db)):
    result = _build_analysis(payload.text_a, payload.text_b, payload.name_a, payload.name_b)
    row = None
    if payload.save:
        row = _persist(db, result, file_type="Text")
    result["id"] = row.id if row else None
    result["created_at"] = (row.created_at.isoformat() if row else datetime.datetime.utcnow().isoformat())
    return result


@router.post("/files", response_model=AnalysisResult)
async def analyze_files(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    name_a: str = Form(None),
    name_b: str = Form(None),
    save: bool = Form(True),
    db: Session = Depends(get_db),
):
    text_a = await extract_text_from_upload(file_a)
    text_b = await extract_text_from_upload(file_b)
    final_name_a = name_a.strip() if name_a and name_a.strip() else file_a.filename
    final_name_b = name_b.strip() if name_b and name_b.strip() else file_b.filename
    result = _build_analysis(text_a, text_b, final_name_a, final_name_b)
    ext = file_a.filename.lower().split(".")[-1].upper()
    row = None
    if save:
        row = _persist(db, result, file_type=ext)
    result["id"] = row.id if row else None
    result["created_at"] = (row.created_at.isoformat() if row else datetime.datetime.utcnow().isoformat())
    return result


@router.post("/multi", response_model=MultiDocAnalyzeResponse)
def analyze_multi(payload: MultiDocAnalyzeRequest, db: Session = Depends(get_db)):
    import json

    docs = payload.documents
    n = len(docs)
    matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        matrix[i][i] = 1.0

    doc_stats = [document_statistics(d.text) for d in docs]

    model = sim._get_semantic_model()
    embeddings = None
    semantic_available = False
    if model is not None and n > 0:
        try:
            embeddings = model.encode([d.text for d in docs])
            semantic_available = True
        except Exception:
            embeddings = None
            semantic_available = False

    pair_details: list[MultiDocPairDetail] = []

    for i, j in itertools.combinations(range(n), 2):
        cos = sim.cosine_tfidf_similarity(docs[i].text, docs[j].text)
        jac = sim.jaccard_similarity(docs[i].text, docs[j].text)
        if semantic_available and embeddings is not None:
            sem = float(max(0.0, min(1.0, sk_cosine([embeddings[i]], [embeddings[j]])[0][0])))
        else:
            sem = 0.0
        overall = sim.overall_score(cos, jac, sem, semantic_available)
        category = sim.categorize(overall)

        matrix[i][j] = round(overall, 4)
        matrix[j][i] = round(overall, 4)

        kw_res = kw.common_and_unique_keywords(docs[i].text, docs[j].text, top_n=8)
        pair_details.append(
            MultiDocPairDetail(
                index_a=i,
                index_b=j,
                a=docs[i].name,
                b=docs[j].name,
                overall_score=round(overall, 4),
                cosine_similarity=round(cos, 4),
                jaccard_similarity=round(jac, 4),
                semantic_similarity=round(sem, 4),
                semantic_available=semantic_available,
                category=category,
                common_keywords=kw_res["common"][:8],
                stats_a=doc_stats[i],
                stats_b=doc_stats[j],
            )
        )

    pair_details.sort(key=lambda p: p.overall_score, reverse=True)

    most_similar = None
    least_similar = None
    avg_similarity = 0.0
    if pair_details:
        top = pair_details[0]
        bot = pair_details[-1]
        most_similar = MultiDocPairResult(a=top.a, b=top.b, score=top.overall_score, category=top.category)
        least_similar = MultiDocPairResult(a=bot.a, b=bot.b, score=bot.overall_score, category=bot.category)
        avg_similarity = round(sum(p.overall_score for p in pair_details) / len(pair_details), 4)

    corpus_counter = Counter()
    for d in docs:
        corpus_counter.update(tokenize(d.text))
    corpus_keywords = [w for w, _ in corpus_counter.most_common(12)]

    comparison_row = None
    if payload.save and n >= 2:
        doc_names_list = [d.name for d in docs]
        title = payload.title or f"Comparison: {', '.join(doc_names_list[:3])}{'...' if len(doc_names_list) > 3 else ''}"
        comparison_row = Comparison(
            title=title,
            document_names=", ".join(doc_names_list),
            documents_json=json.dumps([{"name": d.name, "preview": d.text[:300]} for d in docs]),
            matrix_json=json.dumps(matrix),
            pairs_json=json.dumps([p.dict() for p in pair_details]),
            most_similar_a=most_similar.a if most_similar else "",
            most_similar_b=most_similar.b if most_similar else "",
            most_similar_score=most_similar.score if most_similar else 0.0,
            most_similar_category=most_similar.category or "" if most_similar else "",
            average_similarity=avg_similarity,
            pair_count=len(pair_details),
        )
        db.add(comparison_row)
        db.commit()
        db.refresh(comparison_row)

    return MultiDocAnalyzeResponse(
        id=comparison_row.id if comparison_row else None,
        title=comparison_row.title if comparison_row else (payload.title or "Multi-Document Comparison"),
        names=[d.name for d in docs],
        matrix=matrix,
        most_similar=most_similar,
        least_similar=least_similar,
        average_similarity=avg_similarity,
        pairs=pair_details,
        corpus_keywords=corpus_keywords,
        created_at=comparison_row.created_at.isoformat() if comparison_row else datetime.datetime.utcnow().isoformat(),
    )

