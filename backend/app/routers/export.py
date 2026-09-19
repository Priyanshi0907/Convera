from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (Paragraph, SimpleDocTemplate, Spacer, Table,
                                 TableStyle)
from sqlalchemy.orm import Session

from ..database import Analysis, get_db

router = APIRouter(prefix="/api/export", tags=["export"])


def _get_row(analysis_id: int, db: Session) -> Analysis:
    row = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return row


@router.get("/{analysis_id}/csv")
def export_csv(analysis_id: int, db: Session = Depends(get_db)):
    row = _get_row(analysis_id, db)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Document A", row.doc_a_name])
    writer.writerow(["Document B", row.doc_b_name])
    writer.writerow(["Cosine Similarity", f"{row.cosine_similarity:.4f}"])
    writer.writerow(["Jaccard Similarity", f"{row.jaccard_similarity:.4f}"])
    writer.writerow(["Semantic Similarity", f"{row.semantic_similarity:.4f}"])
    writer.writerow(["Overall Score", f"{row.overall_score:.4f}"])
    writer.writerow(["Category", row.category])
    writer.writerow(["Topic A", row.topic_a])
    writer.writerow(["Topic B", row.topic_b])
    writer.writerow(["Topic Overlap", f"{row.topic_overlap:.4f}"])
    writer.writerow(["Common Keywords", row.common_keywords])
    writer.writerow(["Unique to A", row.unique_a])
    writer.writerow(["Unique to B", row.unique_b])
    writer.writerow(["Date", row.created_at.isoformat()])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=similarity_report_{analysis_id}.csv"},
    )


@router.get("/{analysis_id}/pdf")
def export_pdf(analysis_id: int, db: Session = Depends(get_db)):
    row = _get_row(analysis_id, db)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=0.6 * inch, bottomMargin=0.6 * inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleGold", parent=styles["Title"], textColor=colors.HexColor("#8a5a2b"))
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], textColor=colors.HexColor("#3d2b1f"))

    elements = [
        Paragraph("Document Similarity Report", title_style),
        Spacer(1, 12),
        Paragraph(f"<b>Document A:</b> {row.doc_a_name}", styles["Normal"]),
        Paragraph(f"<b>Document B:</b> {row.doc_b_name}", styles["Normal"]),
        Paragraph(f"<b>Date:</b> {row.created_at.strftime('%b %d, %Y')}", styles["Normal"]),
        Spacer(1, 16),
        Paragraph(f"Overall Similarity: {row.overall_score * 100:.1f}% &mdash; {row.category}", heading_style),
        Spacer(1, 10),
    ]

    table_data = [
        ["Method", "Score"],
        ["Cosine Similarity (TF-IDF)", f"{row.cosine_similarity * 100:.1f}%"],
        ["Jaccard Similarity", f"{row.jaccard_similarity * 100:.1f}%"],
        ["Semantic Similarity", f"{row.semantic_similarity * 100:.1f}%"],
    ]
    table = Table(table_data, colWidths=[3 * inch, 2 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#d4a574")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f1ea")]),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 18))

    elements.append(Paragraph("Common Keywords", heading_style))
    elements.append(Paragraph(row.common_keywords.replace(",", ", ") or "None", styles["Normal"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"Unique to {row.doc_a_name}", heading_style))
    elements.append(Paragraph(row.unique_a.replace(",", ", ") or "None", styles["Normal"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(f"Unique to {row.doc_b_name}", heading_style))
    elements.append(Paragraph(row.unique_b.replace(",", ", ") or "None", styles["Normal"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("Topic Analysis", heading_style))
    elements.append(
        Paragraph(
            f"Document A primary topic: <b>{row.topic_a}</b><br/>"
            f"Document B primary topic: <b>{row.topic_b}</b><br/>"
            f"Topic overlap: <b>{row.topic_overlap * 100:.1f}%</b>",
            styles["Normal"],
        )
    )
    elements.append(Spacer(1, 14))
    elements.append(
        Paragraph(
            "<i>Note: similarity scores measure vector/word overlap between documents. "
            "They are not an \"accuracy\" metric.</i>",
            styles["Normal"],
        )
    )

    doc.build(elements)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=similarity_report_{analysis_id}.pdf"},
    )
