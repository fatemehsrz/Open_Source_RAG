from unittest.mock import patch, MagicMock
import numpy as np
from embeddings.embedder import Embedder


@patch("embeddings.embedder.SentenceTransformer")
def test_embed_returns_list_of_vectors(mock_st):
    fake_model = MagicMock()
    fake_model.encode.return_value = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
    mock_st.return_value = fake_model

    embedder = Embedder()
    result = embedder.embed(["text one", "text two"])

    assert len(result) == 2
    assert len(result[0]) == 3
    assert isinstance(result[0][0], float)


@patch("embeddings.embedder.SentenceTransformer")
def test_embed_one_returns_single_vector(mock_st):
    fake_model = MagicMock()
    fake_model.encode.return_value = np.array([[0.1, 0.2]])
    mock_st.return_value = fake_model

    embedder = Embedder()
    result = embedder.embed_one("single text")

    assert isinstance(result, list)
    assert len(result) == 2
