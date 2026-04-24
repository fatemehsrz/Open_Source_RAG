import os
from dotenv import load_dotenv

load_dotenv()

HF_MODEL = os.getenv("HF_MODEL", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
HF_DEVICE = os.getenv("HF_DEVICE", "cpu")  # set to "cuda" if GPU is available
HF_MAX_NEW_TOKENS = int(os.getenv("HF_MAX_NEW_TOKENS", "512"))

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "murata_catalog")

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 500))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 50))

TOP_K = int(os.getenv("TOP_K", 5))

MURATA_PDF_URLS = [
    "https://www.murata.com/-/media/webrenewal/support/library/catalog/products/ble-appguide.ashx?la=en-us&cvid=20201202062645000000",
    "https://www.murata.com/-/media/webrenewal/support/library/catalog/products/murataoverview.ashx?la=en-us&cvid=20220818072215000000",
    "https://www.murata.com/-/media/webrenewal/support/library/catalog/products/capacitor/polymer/c90e.ashx?la=en-us&cvid=20240517050000000000",
    "https://www.murata.com/-/media/webrenewal/support/library/catalog/products/power-products/mps-dcdc.ashx?la=en-us&cvid=20230119010000000000",
]
