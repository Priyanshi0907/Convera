"""Extract raw text from uploaded files of various formats."""
import io

import pdfplumber
from docx import Document as DocxDocument
from fastapi import HTTPException, UploadFile


def extract_text_from_bytes(filename: str, content: bytes) -> str:
    lower = filename.lower()
    try:
        if lower.endswith(".txt"):
            return content.decode("utf-8", errors="ignore")
        if lower.endswith(".pdf"):
            text_parts = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        if lower.endswith(".docx"):
            doc = DocxDocument(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs)
        # Fallback: try to decode as plain text
        return content.decode("utf-8", errors="ignore")
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Could not parse '{filename}': {exc}") from exc


async def extract_text_from_upload(file: UploadFile) -> str:
    content = await file.read()
    return extract_text_from_bytes(file.filename, content)


def file_type_from_filename(filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return "PDF"
    if lower.endswith(".docx"):
        return "DOCX"
    if lower.endswith(".txt"):
        return "Text"
    return "Text"
