# Convera — Intelligent Document & Text Similarity Engine

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

---

## 🌟 Overview

**Convera** is a full-stack Natural Language Processing (NLP) application designed to evaluate, dissect, and visualize how closely two or more documents relate in both **lexical composition** (exact wording, frequencies, and token sets) and **semantic meaning** (deep contextual embeddings).

Whether analyzing plagiarism, comparing contracts, benchmarking research papers, or clustering literature, Convera provides clear metrics, keyword breakdowns, document statistics, interactive heatmaps, and exportable reports.

---

## ⚡ Key Capabilities

### 1. Multi-Engine Similarity Scoring
Convera computes three complementary similarity metrics for each comparison:
- **Lexical Vectorization (TF-IDF + Cosine Similarity):** Captures term weighting and frequency relevance across the document corpus.
- **Lexical Set Overlap (Jaccard Similarity):** Computes unique token intersection over union, revealing direct vocabulary sharing.
- **Deep Semantic Embeddings (`all-MiniLM-L6-v2` Sentence Transformer):** Generates dense neural vectors to detect conceptual alignment and contextual parity even when phrasing differs completely.

### 2. Deep Document Diagnostics
- **Shared & Distinct Keyword Analysis:** Instantly highlights common terms and unique vocabulary for each document.
- **Word-Level Shared Term Highlighting:** Visual text inspector displaying highlighted tokens for quick visual inspection.
- **Document Profiling:** Comprehensive corpus statistics including character counts, word counts, sentence counts, and unique vocabulary density.
- **Heuristic Topic Modeling:** Extracts dominant TF-IDF topics with calculated topic overlap percentages.
- **Similarity Categorization:** Clear classification spectrum (*Very Similar*, *Similar*, *Moderately Similar*, *Slightly Similar*, *Very Different*).

### 3. Multi-Document Comparison & Heatmaps
- Upload or select multiple documents to compute an $N \times N$ pairwise similarity matrix.
- Interactive color-graded similarity heatmap with immediate detection of the **Most Similar** and **Least Similar** document pairs.

### 4. Format Ingestion & File Extraction
- Upload plain text (`.txt`), Adobe PDF (`.pdf` via `pdfplumber`), and Word documents (`.docx` via `python-docx`).
- In-browser scratchpad and manual text editor for instant comparisons.

### 5. History, Persistence & Reporting
- Built-in SQLite database storing analysis runs, document libraries, and comparison metrics.
- Export results directly into formatted **PDF summary reports** (generated with `reportlab`) or structured **CSV data files**.

---

## 🏗️ Architecture

```
Convera/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint & middleware
│   │   ├── database.py           # SQLAlchemy SQLite models & session management
│   │   ├── text_extraction.py    # Multi-format parser (TXT, PDF, DOCX)
│   │   ├── preprocessing.py       # Tokenization, cleaning & text statistics
│   │   ├── similarity.py         # TF-IDF Cosine, Jaccard & Sentence-Transformer models
│   │   ├── keywords.py           # Keyword extraction & TF-IDF topic heuristics
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   └── routers/
│   │       ├── auth.py           # User authentication & profile management
│   │       ├── analyze.py        # /api/analyze (text, files, multi-document matrix)
│   │       ├── documents.py      # /api/documents library management
│   │       ├── history.py        # /api/history retrieval, summary stats & filters
│   │       └── export.py         # /api/export PDF & CSV generation
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/           # UI components (Sidebar, TopBar, Heatmap, Modals, etc.)
│   │   ├── pages/                # Home, Analyze, Compare, Documents, History, Settings, Auth
│   │   └── lib/api.js            # Axios client with baseURL proxying
│   ├── tailwind.config.js        # Luxury dark & warm gold design system
│   ├── vite.config.js            # Vite bundler & API reverse proxy configuration
│   └── package.json              # Frontend dependencies and scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.x or higher
- **npm:** 9.x or higher

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Priyanshi0907/Convera.git
cd Convera
```

---

### Step 2: Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.\venv\Scripts\activate.bat
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI server
uvicorn app.main:app --reload --port 8000
```

> **Note:** The backend runs at `http://127.0.0.1:8000`. On first run, a SQLite database (`backend/data.db`) is generated automatically. The semantic transformer model (`all-MiniLM-L6-v2`, ~80MB) downloads once on initial use and caches locally for subsequent offline execution.

Interactive API Swagger documentation is available at:
👉 **`http://127.0.0.1:8000/docs`**

---

### Step 3: Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

The frontend dev server automatically proxies all `/api/*` calls to the FastAPI backend running on port 8000.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze/text` | Compare two raw text documents (Cosine, Jaccard, Semantic) |
| `POST` | `/api/analyze/files` | Upload and analyze two files (`.txt`, `.pdf`, `.docx`) |
| `POST` | `/api/analyze/multi` | Compute an $N \times N$ pairwise similarity matrix and heatmap |
| `GET` | `/api/documents` | Fetch all saved documents in user library |
| `POST` | `/api/documents` | Upload a new document to library |
| `DELETE`| `/api/documents/{id}` | Delete document from library |
| `GET` | `/api/history` | Retrieve past analysis sessions |
| `GET` | `/api/history/stats/summary` | Aggregate analytics (analyses count, average similarity score) |
| `GET` | `/api/export/{id}/pdf` | Generate and download a formatted PDF report |
| `GET` | `/api/export/{id}/csv` | Download raw analysis metrics in CSV format |

---

## 🎨 Design Philosophy

Convera features a bespoke dark-mode interface with warm gold/amber accents, refined typography (`Playfair Display` serif headers and `Inter` body text), subtle micro-interactions, responsive sidebars, and accessible data visualizations tailored for research and professional workflows.

---

## 🛠️ Troubleshooting

- **CORS or Network Issues:** Ensure the backend is running on `http://127.0.0.1:8000`. The Vite proxy redirects `/api` calls directly to port 8000.
- **Semantic Model Download:** If semantic similarity shows `N/A`, ensure you have an active internet connection when running your first similarity check so that Hugging Face can download `all-MiniLM-L6-v2`. Subsequent runs execute fully offline.
- **PDF/DOCX Extraction Errors:** Verify that `pdfplumber` and `python-docx` are properly installed in your active virtual environment.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

Developed by **[Priyanshi Choudhary](https://github.com/Priyanshi0907)**.
Repository: [https://github.com/Priyanshi0907/Convera](https://github.com/Priyanshi0907/Convera)
