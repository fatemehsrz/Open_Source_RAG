import hashlib
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION


class ChromaStore:
    """ChromaDB-backed vector store with metadata support."""

    def __init__(
        self,
        persist_dir: str = CHROMA_PERSIST_DIR,
        collection_name: str = CHROMA_COLLECTION,
    ):
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def _make_id(self, text: str, source: str, page: int, chunk_index: int) -> str:
        key = f"{source}|{page}|{chunk_index}|{text[:64]}"
        return hashlib.md5(key.encode()).hexdigest()

    def add_chunks(self, chunks: List[Dict], embeddings: List[List[float]]) -> None:
        """Store chunks with their embeddings.

        Each chunk dict must have: text, source, page, chunk_index.
        """
        ids = [
            self._make_id(c["text"], c["source"], c["page"], c["chunk_index"])
            for c in chunks
        ]
        documents = [c["text"] for c in chunks]
        metadatas = [
            {"source": c["source"], "page": c["page"], "chunk_index": c["chunk_index"]}
            for c in chunks
        ]

        # Upsert to avoid duplicates on re-ingestion
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def query(
        self, query_embedding: List[float], top_k: int = 5
    ) -> List[Dict]:
        """Return top-k similar chunks with metadata and distance scores."""
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        hits = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            hits.append({
                "text": doc,
                "source": meta.get("source"),
                "page": meta.get("page"),
                "chunk_index": meta.get("chunk_index"),
                "score": 1 - dist,  # cosine similarity from cosine distance
            })
        return hits

    def count(self) -> int:
        return self.collection.count()

    def reset(self) -> None:
        """Delete all documents in the collection."""
        self.collection.delete(where={"chunk_index": {"$gte": 0}})
