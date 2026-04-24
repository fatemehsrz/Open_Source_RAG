"""Entry point: ingest Murata catalog PDFs and launch an interactive Q&A loop."""
import sys
from config import MURATA_PDF_URLS
from rag import RAGPipeline


def ingest(pipeline: RAGPipeline) -> None:
    count = pipeline.ingest_urls(MURATA_PDF_URLS)
    print(f"\nDone. {count} chunks are now searchable.\n")


def interactive_loop(pipeline: RAGPipeline) -> None:
    print("RAG ready. Type your question (or 'quit' to exit).\n")
    while True:
        try:
            question = input("Q: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if not question:
            continue
        if question.lower() in {"quit", "exit", "q"}:
            break

        result = pipeline.query(question)
        print(f"\nAnswer:\n{result['answer']}\n")
        print("Sources:")
        for src in result["sources"]:
            print(f"  - {src}")
        print()


def main() -> None:
    pipeline = RAGPipeline()

    print(f"LLM: {pipeline.llm.model_name} | Device: {pipeline.llm._pipe.device}")

    command = sys.argv[1] if len(sys.argv) > 1 else "run"

    if command == "ingest":
        ingest(pipeline)
    elif command == "query" and len(sys.argv) > 2:
        question = " ".join(sys.argv[2:])
        result = pipeline.query(question)
        print(result["answer"])
    else:
        # Default: ingest if collection is empty, then interactive loop
        if pipeline.store.count() == 0:
            print("Collection is empty — ingesting PDFs first...")
            ingest(pipeline)
        interactive_loop(pipeline)


if __name__ == "__main__":
    main()
