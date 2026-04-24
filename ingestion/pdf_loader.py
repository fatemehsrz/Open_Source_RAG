import io
import requests
import pdfplumber
from typing import List, Dict


def load_pdf_from_url(url: str, timeout: int = 30) -> List[Dict]:
    """Download a PDF from a URL and extract text page by page.

    Returns a list of dicts with keys: page, text, source.
    """
    headers = {"User-Agent": "Mozilla/5.0 (compatible; RAG-Bot/1.0)"}
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()

    pages = []
    with pdfplumber.open(io.BytesIO(response.content)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append({"page": page_num, "text": text, "source": url})

    return pages


def load_pdfs_from_urls(urls: List[str], timeout: int = 30) -> List[Dict]:
    """Download and extract text from multiple PDF URLs."""
    all_pages = []
    for url in urls:
        try:
            pages = load_pdf_from_url(url, timeout=timeout)
            all_pages.extend(pages)
            print(f"Loaded {len(pages)} pages from {url}")
        except Exception as e:
            print(f"Failed to load {url}: {e}")
    return all_pages
