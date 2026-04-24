import os
import requests
from typing import List, Dict


def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict]:
    """Free web search via DuckDuckGo — no API key required."""
    from duckduckgo_search import DDGS
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=max_results))
    return [
        {"title": r["title"], "snippet": r["body"], "url": r["href"], "engine": "duckduckgo"}
        for r in results
    ]


def search_brave(query: str, max_results: int = 5) -> List[Dict]:
    """Web search via Brave Search API — requires BRAVE_API_KEY in .env."""
    api_key = os.getenv("BRAVE_API_KEY", "")
    if not api_key:
        raise ValueError("BRAVE_API_KEY is not set in .env")

    resp = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers={"Accept": "application/json", "X-Subscription-Token": api_key},
        params={"q": query, "count": max_results},
        timeout=10,
    )
    resp.raise_for_status()
    items = resp.json().get("web", {}).get("results", [])
    return [
        {"title": r["title"], "snippet": r.get("description", ""), "url": r["url"], "engine": "brave"}
        for r in items
    ]


def search_google(query: str, max_results: int = 5) -> List[Dict]:
    """Web search via Google Custom Search API — requires GOOGLE_API_KEY + GOOGLE_CSE_ID in .env."""
    api_key = os.getenv("GOOGLE_API_KEY", "")
    cse_id = os.getenv("GOOGLE_CSE_ID", "")
    if not api_key or not cse_id:
        raise ValueError("GOOGLE_API_KEY or GOOGLE_CSE_ID is not set in .env")

    resp = requests.get(
        "https://www.googleapis.com/customsearch/v1",
        params={"key": api_key, "cx": cse_id, "q": query, "num": min(max_results, 10)},
        timeout=10,
    )
    resp.raise_for_status()
    items = resp.json().get("items", [])
    return [
        {"title": r["title"], "snippet": r.get("snippet", ""), "url": r["link"], "engine": "google"}
        for r in items
    ]


def web_search(engine: str, query: str, max_results: int = 5) -> List[Dict]:
    """Dispatch to the correct search engine."""
    dispatch = {
        "duckduckgo": search_duckduckgo,
        "brave": search_brave,
        "google": search_google,
    }
    fn = dispatch.get(engine)
    if fn is None:
        raise ValueError(f"Unknown engine '{engine}'. Choose from: {list(dispatch)}")
    return fn(query, max_results)


def format_web_results(results: List[Dict]) -> str:
    """Format web search results into a context string for the LLM."""
    parts = []
    for i, r in enumerate(results, 1):
        parts.append(f"[Web {i}] {r['title']}\n{r['snippet']}\nURL: {r['url']}")
    return "\n\n".join(parts)
