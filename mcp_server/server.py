"""MCP server exposing RAG + web search tools.

Run standalone:
    python -m mcp_server.server

Or register in Claude Code:
    claude mcp add rag-search -- python -m mcp_server.server
"""
from mcp.server.fastmcp import FastMCP
from mcp_server.search_tools import search_duckduckgo, search_brave, search_google

mcp = FastMCP("RAG Search Server")


@mcp.tool()
def duckduckgo_search(query: str, max_results: int = 5) -> list:
    """Search the web using DuckDuckGo (free, no API key needed)."""
    return search_duckduckgo(query, max_results)


@mcp.tool()
def brave_search(query: str, max_results: int = 5) -> list:
    """Search the web using Brave Search API (requires BRAVE_API_KEY in .env)."""
    return search_brave(query, max_results)


@mcp.tool()
def google_search(query: str, max_results: int = 5) -> list:
    """Search the web using Google Custom Search (requires GOOGLE_API_KEY + GOOGLE_CSE_ID in .env)."""
    return search_google(query, max_results)


@mcp.tool()
def rag_search(query: str, top_k: int = 5) -> list:
    """Search the local Murata catalog knowledge base (ChromaDB)."""
    from embeddings import Embedder
    from vector_store import ChromaStore
    embedder = Embedder()
    store = ChromaStore()
    embedding = embedder.embed_one(query)
    return store.query(embedding, top_k=top_k)


if __name__ == "__main__":
    mcp.run()
