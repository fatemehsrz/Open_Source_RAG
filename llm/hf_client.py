from typing import Optional
from transformers import pipeline, AutoTokenizer
from config import HF_MODEL, HF_DEVICE, HF_MAX_NEW_TOKENS

_RAG_SYSTEM_PROMPT = (
    "You are a helpful technical assistant. "
    "Answer the user's question using ONLY the provided context. "
    "If the context does not contain enough information, say so clearly. "
    "Cite the source page numbers when possible."
)


class HFClient:
    """HuggingFace Transformers-based LLM client for RAG generation.

    Works with any causal LM available on the HuggingFace Hub.
    Default: TinyLlama/TinyLlama-1.1B-Chat-v1.0 (runs on CPU, ~600 MB).
    Swap HF_MODEL in .env for larger models (Phi-3-mini, Mistral-7B, etc.).
    """

    def __init__(
        self,
        model_name: str = HF_MODEL,
        device: str = HF_DEVICE,
        max_new_tokens: int = HF_MAX_NEW_TOKENS,
    ):
        self.model_name = model_name
        self.max_new_tokens = max_new_tokens
        self._pipe = pipeline(
            "text-generation",
            model=model_name,
            device=device,
            torch_dtype="auto",
        )
        self._tokenizer = self._pipe.tokenizer

    def generate(self, query: str, context: str, system_prompt: Optional[str] = None) -> str:
        """Generate an answer grounded in the provided context."""
        system = system_prompt or _RAG_SYSTEM_PROMPT
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
        ]

        # Use chat template if available, otherwise fall back to plain prompt
        if self._tokenizer.chat_template:
            prompt = self._tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
        else:
            prompt = f"{system}\n\nContext:\n{context}\n\nQuestion: {query}\nAnswer:"

        output = self._pipe(
            prompt,
            max_new_tokens=self.max_new_tokens,
            do_sample=False,
            return_full_text=False,
        )
        return output[0]["generated_text"].strip()

    def is_available(self) -> bool:
        return self._pipe is not None
