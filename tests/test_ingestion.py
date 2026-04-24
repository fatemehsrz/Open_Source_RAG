import pytest
from unittest.mock import patch, MagicMock
import io

from ingestion.pdf_loader import load_pdf_from_url
from ingestion.chunker import chunk_text, chunk_pages


# --- pdf_loader ---

class FakePage:
    def __init__(self, text):
        self._text = text

    def extract_text(self):
        return self._text


class FakePDF:
    def __init__(self, pages):
        self.pages = [FakePage(t) for t in pages]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


@patch("ingestion.pdf_loader.pdfplumber.open")
@patch("ingestion.pdf_loader.requests.get")
def test_load_pdf_from_url_returns_pages(mock_get, mock_open):
    mock_get.return_value = MagicMock(status_code=200, content=b"%PDF-fake")
    mock_open.return_value = FakePDF(["Page one text", "Page two text", ""])

    pages = load_pdf_from_url("http://example.com/test.pdf")

    assert len(pages) == 2  # empty page filtered out
    assert pages[0]["page"] == 1
    assert pages[0]["text"] == "Page one text"
    assert pages[0]["source"] == "http://example.com/test.pdf"


@patch("ingestion.pdf_loader.requests.get")
def test_load_pdf_raises_on_http_error(mock_get):
    mock_get.return_value = MagicMock()
    mock_get.return_value.raise_for_status.side_effect = Exception("404")

    with pytest.raises(Exception):
        load_pdf_from_url("http://example.com/missing.pdf")


# --- chunker ---

def test_chunk_text_basic():
    text = " ".join([f"word{i}" for i in range(20)])
    chunks = chunk_text(text, source="test.pdf", page=1, chunk_size=10, chunk_overlap=2)
    assert len(chunks) > 1
    assert all("text" in c for c in chunks)
    assert chunks[0]["chunk_index"] == 0


def test_chunk_text_empty():
    assert chunk_text("", source="test.pdf", page=1) == []


def test_chunk_pages_aggregates():
    pages = [
        {"text": "hello world foo bar baz", "source": "a.pdf", "page": 1},
        {"text": "another page with more words", "source": "a.pdf", "page": 2},
    ]
    chunks = chunk_pages(pages, chunk_size=3, chunk_overlap=1)
    assert len(chunks) > 2
    sources = {c["source"] for c in chunks}
    assert sources == {"a.pdf"}
