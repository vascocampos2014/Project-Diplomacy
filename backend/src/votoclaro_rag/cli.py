"""Command line: votoclaro <command>. Run `votoclaro --help`."""

import argparse
import logging


def main() -> None:
    p = argparse.ArgumentParser(prog="votoclaro", description="VotoClaro RAG backend")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("ingest", help="sync votes, then download and extract bill texts")
    s.add_argument("--limit", type=int, default=200, help="how many bill texts to fetch (most recently voted first)")
    sub.add_parser("index", help="chunk and embed downloaded texts")
    s = sub.add_parser("search", help="try retrieval without the LLM")
    s.add_argument("query")
    s.add_argument("-k", type=int, default=5)
    s.add_argument("--mode", choices=["hybrid", "vector", "keyword"], default="hybrid")
    s = sub.add_parser("ask", help="ask a question (needs an LLM API key)")
    s.add_argument("question")
    s.add_argument("-v", "--verbose", action="store_true", help="show tool calls")
    sub.add_parser("stats", help="what is in the database")
    s = sub.add_parser("eval", help="run the evaluation sets")
    s.add_argument("which", choices=["retrieval", "answers"])
    s.add_argument("--model", help="LLM model for 'answers' (default from config)")
    s.add_argument("--only", help="run one case id or kind (votes, content, mixed, unanswerable, neutrality)")

    args = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)

    if args.cmd == "ingest":
        from votoclaro_rag.ingest import fetch_texts, sync_votes
        from votoclaro_rag.openar import OpenAR

        api = OpenAR()
        print(f"votações sincronizadas: {sync_votes(api)}")
        ok, failed = fetch_texts(api, args.limit)
        print(f"textos: {ok} extraídos, {failed} falharam")
    elif args.cmd == "index":
        from votoclaro_rag.index import build_index

        print(f"chunks adicionados: {build_index()}")
    elif args.cmd == "search":
        from votoclaro_rag.search import search

        for h in search(args.query, k=args.k, mode=args.mode):
            print(f"[{h.score:.4f}] {h.referencia} · {h.secao}\n  {h.titulo[:100]}\n  {h.texto[:240]!r}\n")
    elif args.cmd == "ask":
        from votoclaro_rag.agent import ask

        result = ask(args.question)
        if args.verbose:
            for call in result.tool_calls:
                print(f"→ {call['name']}({call['arguments']})")
            print()
        print(result.answer)
    elif args.cmd == "eval" and args.which == "retrieval":
        from votoclaro_rag.evals import run_retrieval

        for mode, r in run_retrieval().items():
            print(f"{mode:>8}: recall@5 {r['recall']:.0%}  MRR {r['mrr']:.2f}")
            for q in r["misses"]:
                print(f"           falhou: {q}")
    elif args.cmd == "eval" and args.which == "answers":
        from votoclaro_rag.config import LLM_MODEL
        from votoclaro_rag.evals import run_answers

        s = run_answers(model=args.model or LLM_MODEL, only=args.only)
        for r in s["rows"]:
            mark = "✓" if r["passed"] else "✗"
            detail = r.get("error") or ", ".join(k for k, ok in r["checks"].items() if not ok)
            print(f"{mark} {r['id']:<22} {detail}")
        print(f"\n{s['model']}: {s['passed']}/{s['total']} {s['by_kind']}")
        print(f"média {s['avg_tokens']} tokens, {s['avg_seconds']} s por pergunta -> {s['file']}")
    elif args.cmd == "stats":
        from votoclaro_rag.db import connect

        c = connect()
        for label, sql in [
            ("votações", "SELECT COUNT(*) FROM votacoes"),
            ("iniciativas", "SELECT COUNT(*) FROM iniciativas"),
            ("com texto", "SELECT COUNT(*) FROM iniciativas WHERE texto IS NOT NULL"),
            ("texto falhou", "SELECT COUNT(*) FROM iniciativas WHERE texto_erro IS NOT NULL"),
            ("chunks", "SELECT COUNT(*) FROM chunks"),
        ]:
            print(f"{label:>14}: {c.execute(sql).fetchone()[0]}")
