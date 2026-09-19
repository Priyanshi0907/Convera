"""SQLite database setup using SQLAlchemy ORM."""
import datetime
import os

from sqlalchemy import (Column, DateTime, Float, ForeignKey, Integer, String,
                         Text, create_engine)
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # txt, pdf, docx, pasted
    content = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    char_count = Column(Integer, default=0)
    sentence_count = Column(Integer, default=0)
    unique_words = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    doc_a_name = Column(String, nullable=False)
    doc_b_name = Column(String, nullable=False)
    doc_a_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    doc_b_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    cosine_similarity = Column(Float, default=0.0)
    jaccard_similarity = Column(Float, default=0.0)
    semantic_similarity = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    category = Column(String, default="")
    common_keywords = Column(Text, default="")  # comma separated
    unique_a = Column(Text, default="")
    unique_b = Column(Text, default="")
    topic_a = Column(String, default="")
    topic_b = Column(String, default="")
    topic_overlap = Column(Float, default=0.0)
    stats_json = Column(Text, default="{}")
    file_type = Column(String, default="Text")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Multi-Document Comparison")
    document_names = Column(Text, nullable=False)  # Comma-separated or JSON string
    documents_json = Column(Text, default="[]")  # Stores document names and snippets
    matrix_json = Column(Text, default="[]")  # 2D similarity matrix JSON
    pairs_json = Column(Text, default="[]")  # List of pairs JSON
    most_similar_a = Column(String, default="")
    most_similar_b = Column(String, default="")
    most_similar_score = Column(Float, default=0.0)
    most_similar_category = Column(String, default="")
    average_similarity = Column(Float, default=0.0)
    pair_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)
    # Seed default demo user if none exists
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "demo@convera.ai").first():
            import hashlib
            salt = "convera_secret_salt_2024"
            pwd_hash = hashlib.sha256((salt + "password123").encode("utf-8")).hexdigest()
            demo_user = User(
                email="demo@convera.ai",
                hashed_password=f"{salt}${pwd_hash}",
                full_name="Alex Morgan",
            )
            db.add(demo_user)
            db.commit()
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

