from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import analyze, auth, documents, export, history

app = FastAPI(
    title="Convera - Document Similarity Analyzer API",
    description="TF-IDF/Cosine, Jaccard, and Semantic document similarity analysis with user authentication.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(documents.router)
app.include_router(export.router)


