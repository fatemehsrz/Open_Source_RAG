from typing import List, Dict
from embeddings import Embedder
from vector_store import ChromaStore
from config import TOP_K


class Retriever:
    """Embeds a query and fetches the most relevant chunks from ChromaDB."""

    def __init__(self, embedder: Embedder, store: ChromaStore, top_k: int = TOP_K):
        self.embedder = embedder
        self.store = store
        self.top_k = top_k

    def retrieve(self, query: str) -> List[Dict]:
        """Return top-k chunks most relevant to the query."""
        query_embedding = self.embedder.embed_one(query)
        return self.store.query(query_embedding, top_k=self.top_k)

    def format_context(self, hits: List[Dict]) -> str:
        """Format retrieved chunks into a single context string for the LLM."""
        parts = []
        for i, hit in enumerate(hits, start=1):
            parts.append(
                f"[{i}] Source: {hit['source']} | Page: {hit['page']}\n{hit['text']}"
            )
        return "\n\n".join(parts)
