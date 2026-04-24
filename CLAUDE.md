# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Open-source RAG system that ingests Murata product catalog PDFs from URLs, stores them in a local vector database, and answers questions using a locally-running open-source LLM via Ollama.

## Stack

| Layer | Technology |
|-------|-----------|
| LLM | HuggingFace Transformers (`TinyLlama/TinyLlama-1.1B-Chat-v1.0` default) |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`) |
| Vector DB | ChromaDB (local, persistent) |
| PDF parsing | `pdfplumber` + `requests` |
| Backend API | FastAPI + uvicorn (`api/server.py`, port 8000) |
| Frontend | React 18 + TypeScript + Vite (`frontend/`, port 5173) |

## Architecture

```
PDF URLs (config.py)
      ↓
ingestion/pdf_loader.py   → download + extract text page by page
ingestion/chunker.py      → fixed-size word chunks with overlap
      ↓
embeddings/embedder.py    → sentence-transformers encode
      ↓
vector_store/chroma_store.py  → ChromaDB upsert (dedup by MD5 id)
      ↓  (query time)
retrieval/retriever.py    → embed query → cosine search → format context
      ↓
llm/hf_client.py          → system prompt + context + question → HuggingFace model
      ↓
rag/pipeline.py           → orchestrates all layers (RAGPipeline class)
main.py                   → CLI entry point
```

`RAGPipeline` in [rag/pipeline.py](rag/pipeline.py) is the single class that wires everything together. All other modules are independently unit-testable.

## Commands

```bash
# Install Python dependencies
pip install -r requirements.txt

# --- Backend (FastAPI) ---
# Start the API server at http://localhost:8000
uvicorn api.server:app --reload

# --- Frontend (React + TypeScript) ---
cd frontend
npm install        # first time only
npm run dev        # starts at http://localhost:5173

# --- CLI (no frontend) ---
python main.py            # ingest if empty, then interactive Q&A
python main.py ingest     # ingest PDFs only
python main.py query "What is the operating voltage of Murata BLE modules?"

# Run all tests
pytest

# Run a single test file
pytest tests/test_rag.py -v

# Lint / format
ruff check .
ruff format .
```

## Environment

Copy `.env.example` to `.env`. Key variables:

```
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMA_PERSIST_DIR=./chroma_db
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K=5
```

## Data Flow Details

- **Chunking**: word-level fixed windows (`CHUNK_SIZE` words, `CHUNK_OVERLAP` word overlap). Chunk IDs are MD5 hashes — re-ingesting the same PDF is idempotent.
- **Embeddings**: 384-dim vectors from `all-MiniLM-L6-v2`. ChromaDB stores them with cosine distance (`hnsw:space=cosine`).
- **Retrieval score**: reported as `1 - cosine_distance` (higher = more similar).
- **LLM prompt**: system prompt instructs the model to answer only from provided context and cite page numbers.

## Murata PDF Sources

Configured in `config.py` as `MURATA_PDF_URLS`:
- BLE Application Guide
- Murata Overview Catalog
- Polymer Capacitor (C90E)
- DC-DC Power Products (MPS)
