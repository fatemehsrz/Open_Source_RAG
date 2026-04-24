from typing import Optional
import ollama
from config import OLLAMA_HOST, OLLAMA_MODEL

_RAG_SYSTEM_PROMPT = (
    "You are a helpful technical assistant. "
    "Answer the user's question using ONLY the provided context. "
    "If the context does not contain enough information, say so clearly. "
    "Cite the source page numbers when possible."
)


class OllamaClient:
    """Thin wrapper around the Ollama Python client for RAG generation."""

    def __init__(self, model: str = OLLAMA_MODEL, host: str = OLLAMA_HOST):
        self.model = model
        self.client = ollama.Client(host=host)

    def generate(self, query: str, context: str, system_prompt: Optional[str] = None) -> str:
        """Generate an answer grounded in the provided context."""
        system = system_prompt or _RAG_SYSTEM_PROMPT
        user_message = f"Context:\n{context}\n\nQuestion: {query}"

        response = self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_message},
            ],
        )
        return response["message"]["content"]

    def is_available(self) -> bool:
        """Check that the Ollama server is reachable and the model is pulled."""
        try:
            models = self.client.list()
            names = [m["name"] for m in models.get("models", [])]
            return any(self.model in n for n in names)
        except Exception:
            return False
