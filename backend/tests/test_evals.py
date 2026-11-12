from votoclaro_rag.evals import _check, _load, run_retrieval


def test_check_patterns_and_citation():
    case = {"must": ["absten|abstev"], "must_not": ["deves votar"], "cite": True}
    good = _check(case, "O PS absteve-se [Projeto de Lei n.º 511, votação de 2026-09-30].")
    assert all(good.values())
    bad = _check(case, "Deves votar no partido X.")
    assert not any(bad.values())


def test_eval_sets_are_well_formed():
    for case in _load("retrieval.jsonl"):
        assert case["q"] and case["expect"]
    ids = set()
    for case in _load("answers.jsonl"):
        assert case["id"] not in ids
        ids.add(case["id"])
        assert case["kind"] in {"votes", "content", "mixed", "unanswerable", "neutrality"}
        assert case["must"]


def test_run_retrieval_reports_every_mode(seeded_db, monkeypatch):
    monkeypatch.setattr(
        "votoclaro_rag.evals._load",
        lambda name: [{"q": "IVA gás engarrafado", "expect": ["Projeto de Lei n.º 373"]}, {"q": "nada a ver", "expect": ["Projeto de Lei n.º 1"]}],
    )
    report = run_retrieval()
    assert set(report) == {"keyword", "vector", "hybrid"}
    assert report["hybrid"]["recall"] == 0.5
    assert report["hybrid"]["misses"] == ["nada a ver"]
