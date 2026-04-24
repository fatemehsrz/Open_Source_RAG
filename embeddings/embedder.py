from typing import List
from sentence_transformers import SentenceTransformer
from config import EMBEDDING_MODEL


class Embedder:
    """Wraps sentence-transformers for generating text embeddings."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model = SentenceTransformer(model_name)

    def embed(self, texts: List[str]) -> List[List[float]]:
        """Return a list of embedding vectors for the given texts."""
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_one(self, text: str) -> List[float]:
        return self.embed([text])[0]
