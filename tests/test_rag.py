from unittest.mock import MagicMock, patch
from rag.pipeline import RAGPipeline


def _make_pipeline():
    """Build a RAGPipeline with all external dependencies mocked."""
    with patch("rag.pipeline.Embedder") as MockEmbedder, \
         patch("rag.pipeline.ChromaStore") as MockStore, \
         patch("rag.pipeline.HFClient") as MockLLM:

        mock_embedder = MagicMock()
        mock_embedder.embed_one.return_value = [0.1, 0.2, 0.3]
        mock_embedder.embed.return_value = [[0.1, 0.2, 0.3]]
        MockEmbedder.return_value = mock_embedder

        mock_store = MagicMock()
        mock_store.count.return_value = 1
        mock_store.query.return_value = [
            {"text": "Murata BLE module specs", "source": "ble.pdf", "page": 2, "chunk_index": 0, "score": 0.9}
        ]
        MockStore.return_value = mock_store

        mock_llm = MagicMock()
        mock_llm.generate.return_value = "The BLE module supports Bluetooth 5.0."
        mock_llm.is_available.return_value = True
        MockLLM.return_value = mock_llm

        pipeline = RAGPipeline()

    return pipeline, mock_embedder, mock_store, mock_llm


def test_query_returns_answer_and_sources():
    pipeline, _, _, _ = _make_pipeline()
    result = pipeline.query("What BLE standards does Murata support?")

    assert "answer" in result
    assert result["answer"] == "The BLE module supports Bluetooth 5.0."
    assert "sources" in result
    assert "ble.pdf" in result["sources"]


def test_query_calls_embedder_and_store():
    pipeline, mock_embedder, mock_store, _ = _make_pipeline()
    pipeline.query("test question")

    mock_embedder.embed_one.assert_called_once_with("test question")
    mock_store.query.assert_called_once()
