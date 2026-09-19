from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import Analysis, Document, get_db
from ..preprocessing import document_statistics
from ..text_extraction import extract_text_from_upload, file_type_from_filename

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _serialize(row: Document, analyses_count: int = 0) -> dict:
    return {
        "id": row.id,
        "filename": row.filename,
        "file_type": row.file_type,
        "content": row.content or "",
        "word_count": row.word_count,
        "char_count": row.char_count,
        "sentence_count": row.sentence_count,
        "unique_words": row.unique_words,
        "created_at": row.created_at.isoformat(),
        "analyses_count": analyses_count,
    }


@router.get("")
def list_documents(db: Session = Depends(get_db)):
    rows = db.query(Document).order_by(Document.created_at.desc()).all()
    result = []
    for r in rows:
        count = (
            db.query(func.count(Analysis.id))
            .filter((Analysis.doc_a_id == r.id) | (Analysis.doc_b_id == r.id))
            .scalar()
            or 0
        )
        result.append(_serialize(r, count))
    return result


@router.post("")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    text = await extract_text_from_upload(file)
    stats = document_statistics(text)
    doc = Document(
        filename=file.filename,
        file_type=file_type_from_filename(file.filename),
        content=text,
        word_count=stats["words"],
        char_count=stats["characters"],
        sentence_count=stats["sentences"],
        unique_words=stats["unique_words"],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _serialize(doc)


@router.get("/{doc_id}")
def get_document(doc_id: int, db: Session = Depends(get_db)):
    row = db.query(Document).filter(Document.id == doc_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    data = _serialize(row)
    data["content"] = row.content
    return data


@router.delete("")
def delete_all_documents(db: Session = Depends(get_db)):
    db.query(Document).delete()
    db.commit()
    return {"ok": True, "message": "All documents deleted successfully."}


@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    row = db.query(Document).filter(Document.id == doc_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(row)
    db.commit()
    return {"ok": True}

