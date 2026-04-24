from contextlib import asynccontextmanager
from typing import Optional
import asyncio

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import RAGPipeline
from mcp_server.search_tools import web_search, format_web_results
from config import MURATA_PDF_URLS

pipeline: Optional[RAGPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    loop = asyncio.get_event_loop()
    pipeline = await loop.run_in_executor(None, RAGPipeline)
    yield


app = FastAPI(title="Open Source RAG API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class ChatRequest(BaseModel):
    question: str
    engine: Optional[str] = None   # "duckduckgo" | "brave" | "google" | None


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    hits: list[dict]
    web_results: list[dict] = []


class StatusResponse(BaseModel):
    ready: bool
    chunks: int
    model: str


class IngestResponse(BaseModel):
    chunks_stored: int


# ---------- Routes ----------

@app.get("/api/status", response_model=StatusResponse)
def status():
    if pipeline is None:
        return StatusResponse(ready=False, chunks=0, model="loading...")
    return StatusResponse(
        ready=True,
        chunks=pipeline.store.count(),
        model=pipeline.llm.model_name,
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not ready yet")
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    loop = asyncio.get_event_loop()

    # 1. RAG retrieval (always)
    hits = await loop.run_in_executor(None, pipeline.retriever.retrieve, req.question)
    rag_context = pipeline.retriever.format_context(hits)
    rag_sources = list({h["source"] for h in hits})

    # 2. Web search (optional)
    web_results: list[dict] = []
    web_context = ""
    if req.engine:
        try:
            web_results = await loop.run_in_executor(
                None, web_search, req.engine, req.question
            )
            web_context = format_web_results(web_results)
        except Exception as e:
            web_context = f"[Web search unavailable: {e}]"

    # 3. Combine context and generate
    combined_context = rag_context
    if web_context:
        combined_context = f"=== Web Search Results ({req.engine}) ===\n{web_context}\n\n=== Local Catalog ===\n{rag_context}"

    answer = await loop.run_in_executor(
        None, pipeline.llm.generate, req.question, combined_context
    )

    return ChatResponse(
        answer=answer,
        sources=rag_sources,
        hits=hits,
        web_results=web_results,
    )


@app.post("/api/ingest", response_model=IngestResponse)
async def ingest():
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline not ready yet")
    loop = asyncio.get_event_loop()
    count = await loop.run_in_executor(None, pipeline.ingest_urls, MURATA_PDF_URLS)
    return IngestResponse(chunks_stored=count)
