from typing import List, Dict
from tqdm import tqdm

from ingestion import load_pdfs_from_urls, chunk_text
from ingestion.chunker import chunk_pages
from embeddings import Embedder
from vector_store import ChromaStore
from retrieval import Retriever
from llm import HFClient
from config import TOP_K


class RAGPipeline:
    """Orchestrates the full RAG flow: ingest → embed → store → retrieve → generate."""

    def __init__(self):
        self.embedder = Embedder()
        self.store = ChromaStore()
        self.retriever = Retriever(self.embedder, self.store, top_k=TOP_K)
        self.llm = HFClient()

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    def ingest_urls(self, urls: List[str], batch_size: int = 32) -> int:
        """Download PDFs from URLs, chunk, embed, and store them.

        Returns the total number of chunks stored.
        """
        print("Loading PDFs...")
        pages = load_pdfs_from_urls(urls)

        print(f"Chunking {len(pages)} pages...")
        chunks = chunk_pages(pages)
        print(f"Total chunks: {len(chunks)}")

        print("Embedding and storing chunks...")
        total_stored = 0
        for i in tqdm(range(0, len(chunks), batch_size), desc="Batches"):
            batch = chunks[i : i + batch_size]
            texts = [c["text"] for c in batch]
            embeddings = self.embedder.embed(texts)
            self.store.add_chunks(batch, embeddings)
            total_stored += len(batch)

        print(f"Ingestion complete. {total_stored} chunks stored.")
        return total_stored

    # ------------------------------------------------------------------
    # Query
    # ------------------------------------------------------------------

    def query(self, question: str) -> Dict:
        """Retrieve relevant context and generate an answer.

        Returns a dict with keys: answer, sources, hits.
        """
        hits = self.retriever.retrieve(question)
        context = self.retriever.format_context(hits)
        answer = self.llm.generate(query=question, context=context)

        sources = list({h["source"] for h in hits})
        return {"answer": answer, "sources": sources, "hits": hits}
