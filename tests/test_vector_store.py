import pytest
from unittest.mock import patch, MagicMock


@patch("vector_store.chroma_store.chromadb.PersistentClient")
def test_add_and_query(mock_client_cls):
    from vector_store.chroma_store import ChromaStore

    mock_collection = MagicMock()
    mock_client = MagicMock()
    mock_client.get_or_create_collection.return_value = mock_collection
    mock_client_cls.return_value = mock_client

    mock_collection.query.return_value = {
        "documents": [["chunk text"]],
        "metadatas": [[{"source": "a.pdf", "page": 1, "chunk_index": 0}]],
        "distances": [[0.1]],
    }

    store = ChromaStore()

    chunks = [{"text": "chunk text", "source": "a.pdf", "page": 1, "chunk_index": 0}]
    embeddings = [[0.1, 0.2, 0.3]]
    store.add_chunks(chunks, embeddings)
    mock_collection.upsert.assert_called_once()

    hits = store.query([0.1, 0.2, 0.3], top_k=1)
    assert len(hits) == 1
    assert hits[0]["text"] == "chunk text"
    assert abs(hits[0]["score"] - 0.9) < 1e-6
