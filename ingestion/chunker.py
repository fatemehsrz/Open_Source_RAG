from typing import List, Dict
from config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(text: str, source: str, page: int,
               chunk_size: int = CHUNK_SIZE,
               chunk_overlap: int = CHUNK_OVERLAP) -> List[Dict]:
    """Split text into overlapping chunks.

    Returns list of dicts with keys: text, source, page, chunk_index.
    """
    if not text:
        return []

    words = text.split()
    chunks = []
    start = 0
    chunk_index = 0

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk_text_str = " ".join(chunk_words)
        chunks.append({
            "text": chunk_text_str,
            "source": source,
            "page": page,
            "chunk_index": chunk_index,
        })
        chunk_index += 1
        start += chunk_size - chunk_overlap

    return chunks


def chunk_pages(pages: List[Dict],
                chunk_size: int = CHUNK_SIZE,
                chunk_overlap: int = CHUNK_OVERLAP) -> List[Dict]:
    """Chunk a list of page dicts produced by pdf_loader."""
    all_chunks = []
    for page in pages:
        chunks = chunk_text(
            text=page["text"],
            source=page["source"],
            page=page["page"],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        all_chunks.extend(chunks)
    return all_chunks
