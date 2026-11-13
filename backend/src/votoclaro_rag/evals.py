"""Evaluation.

retrieval: does the right bill come back for a paraphrased question?
           Free (no LLM), so run it after every change to chunking or search.
answers:   end-to-end checks on the agent: facts, citations, saying "I don't
           know" when the data has no answer, and political neutrality.
"""

import json
import re
import time
from datetime import datetime
from pathlib import Path

from votoclaro_rag.config import BACKEND_DIR, LLM_MODEL

EVALS_DIR = BACKEND_DIR / "evals"


def _load(name: str) -> list[dict]:
    return [json.loads(ln) for ln in (EVALS_DIR / name).read_text().splitlines() if ln.strip()]


def run_retrieval(k: int = 5) -> dict:
    from votoclaro_rag.search import search

    cases = _load("retrieval.jsonl")
    report = {}
    for mode in ("keyword", "vector", "hybrid"):
        hits = 0
        rr = 0.0
        misses = []
        for case in cases:
            refs = [h.referencia for h in search(case["q"], k=k, mode=mode, max_per_bill=2)]
            # Ranked list of distinct bills, so two passages of one bill don't push others down.
            bills = list(dict.fromkeys(refs))
            rank = next((i for i, b in enumerate(bills) if b in case["expect"]), None)
            if rank is None:
                misses.append(case["q"])
            else:
                hits += 1
                rr += 1 / (rank + 1)
        report[mode] = {"recall": hits / len(cases), "mrr": rr / len(cases), "misses": misses}
    return report


def _check(case: dict, answer: str) -> dict:
    text = answer.lower()
    checks = {}
    for pattern in case.get("must", []):
        checks[f"contém /{pattern}/"] = re.search(pattern.lower(), text) is not None
    for pattern in case.get("must_not", []):
        checks[f"não contém /{pattern}/"] = re.search(pattern.lower(), text) is None
    if case.get("cite"):
        checks["cita fonte"] = re.search(r"\[[^\]]*n\.º\s*\d+", answer) is not None
    return checks


def run_answers(model: str = LLM_MODEL, only: str | None = None, pause: float = 2.0) -> dict:
    from votoclaro_rag.agent import ask

    cases = [c for c in _load("answers.jsonl") if not only or c["kind"] == only or c["id"] == only]
    rows = []
    for case in cases:
        try:
            r = ask(case["q"], model=model, historico=case.get("historico"))
            checks = _check(case, r.answer)
            rows.append(
                {
                    "id": case["id"],
                    "kind": case["kind"],
                    "passed": all(checks.values()),
                    "checks": checks,
                    "answer": r.answer,
                    "tools": [c["name"] for c in r.tool_calls],
                    "tokens": r.prompt_tokens + r.completion_tokens,
                    "seconds": r.seconds,
                }
            )
        except Exception as e:  # rate limits etc.: record and continue
            rows.append({"id": case["id"], "kind": case["kind"], "passed": False, "error": f"{type(e).__name__}: {e}"})
        time.sleep(pause)  # be gentle with free-tier rate limits

    done = [r for r in rows if "error" not in r]
    summary = {
        "model": model,
        "when": datetime.now().isoformat(timespec="seconds"),
        "passed": sum(r["passed"] for r in rows),
        "total": len(rows),
        "by_kind": {
            kind: f"{sum(r['passed'] for r in rows if r['kind'] == kind)}/{sum(1 for r in rows if r['kind'] == kind)}"
            for kind in dict.fromkeys(r["kind"] for r in rows)
        },
        "avg_tokens": round(sum(r["tokens"] for r in done) / len(done)) if done else None,
        "avg_seconds": round(sum(r["seconds"] for r in done) / len(done), 1) if done else None,
        "rows": rows,
    }
    out = EVALS_DIR / "results" / f"{summary['when'].replace(':', '')}_{model.replace('/', '_')}.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    summary["file"] = str(Path(out).relative_to(BACKEND_DIR))
    return summary
