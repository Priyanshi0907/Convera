from __future__ import annotations

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import Analysis, Comparison, Document, get_db

router = APIRouter(prefix="/api/history", tags=["history"])


def _serialize_analysis(row: Analysis) -> dict:
    return {
        "id": row.id,
        "type": "analysis",
        "doc_a_name": row.doc_a_name,
        "doc_b_name": row.doc_b_name,
        "cosine_similarity": row.cosine_similarity,
        "jaccard_similarity": row.jaccard_similarity,
        "semantic_similarity": row.semantic_similarity,
        "overall_score": row.overall_score,
        "category": row.category,
        "common_keywords": [w for w in row.common_keywords.split(",") if w],
        "unique_a": [w for w in row.unique_a.split(",") if w],
        "unique_b": [w for w in row.unique_b.split(",") if w],
        "topic_a": row.topic_a,
        "topic_b": row.topic_b,
        "topic_overlap": row.topic_overlap,
        "file_type": row.file_type,
        "created_at": row.created_at.isoformat(),
    }


def _serialize_comparison(row: Comparison) -> dict:
    return {
        "id": row.id,
        "type": "comparison",
        "title": row.title,
        "document_names": [name.strip() for name in row.document_names.split(",") if name.strip()],
        "documents": json.loads(row.documents_json) if row.documents_json else [],
        "matrix": json.loads(row.matrix_json) if row.matrix_json else [],
        "pairs": json.loads(row.pairs_json) if row.pairs_json else [],
        "most_similar_a": row.most_similar_a,
        "most_similar_b": row.most_similar_b,
        "most_similar_score": row.most_similar_score,
        "most_similar_category": row.most_similar_category,
        "average_similarity": row.average_similarity,
        "pair_count": row.pair_count,
        "created_at": row.created_at.isoformat(),
    }


@router.get("")
def list_history(db: Session = Depends(get_db)):
    rows = db.query(Analysis).order_by(Analysis.created_at.desc()).all()
    return [_serialize_analysis(r) for r in rows]


@router.get("/comparisons")
def list_comparison_history(db: Session = Depends(get_db)):
    rows = db.query(Comparison).order_by(Comparison.created_at.desc()).all()
    return [_serialize_comparison(r) for r in rows]


@router.get("/comparisons/{comp_id}")
def get_comparison(comp_id: int, db: Session = Depends(get_db)):
    row = db.query(Comparison).filter(Comparison.id == comp_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return _serialize_comparison(row)


@router.delete("/comparisons/{comp_id}")
def delete_comparison(comp_id: int, db: Session = Depends(get_db)):
    row = db.query(Comparison).filter(Comparison.id == comp_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Comparison not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.delete("/comparisons")
def clear_comparison_history(db: Session = Depends(get_db)):
    db.query(Comparison).delete()
    db.commit()
    return {"ok": True}


@router.get("/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    row = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _serialize_analysis(row)


@router.delete("/{analysis_id}")
def delete_analysis(analysis_id: int, db: Session = Depends(get_db)):
    row = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.delete("")
def clear_history(db: Session = Depends(get_db)):
    db.query(Analysis).delete()
    db.commit()
    return {"ok": True}


@router.get("/stats/summary")
def quick_stats(db: Session = Depends(get_db)):
    total_analyses = db.query(func.count(Analysis.id)).scalar() or 0
    total_comparisons = db.query(func.count(Comparison.id)).scalar() or 0
    total_documents = db.query(func.count(Document.id)).scalar() or 0
    avg_score = db.query(func.avg(Analysis.overall_score)).scalar() or 0.0
    first = db.query(func.min(Analysis.created_at)).scalar()
    import datetime

    days_active = 1
    if first:
        days_active = max(1, (datetime.datetime.utcnow() - first).days + 1)

    return {
        "total_analyses": total_analyses,
        "total_comparisons": total_comparisons,
        "total_documents": total_documents,
        "avg_similarity": round(float(avg_score) * 100, 1),
        "days_active": days_active,
    }

