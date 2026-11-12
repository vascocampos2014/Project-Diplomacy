"""The weekly refresh's change detection and quality gate (deploy/refresh_space.py)."""

import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("refresh_space", Path(__file__).parents[1] / "deploy" / "refresh_space.py")
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)


def test_stats_see_new_votes_and_changed_votes(seeded_db):
    before = refresh.stats(seeded_db)
    assert before["chunks"] == before["vetores"] > 0
    with seeded_db:
        seeded_db.execute("UPDATE votacoes SET contra = '[\"PS\", \"PSD\"]' WHERE id = (SELECT MIN(id) FROM votacoes)")
    assert refresh.stats(seeded_db) != before  # same count, different content


def test_quality_gate_passes_a_healthy_database(seeded_db):
    assert refresh.quality_problems(seeded_db, refresh.stats(seeded_db), recall=1.0) == []


def test_quality_gate_blocks_low_recall_and_missing_vectors(seeded_db):
    s = refresh.stats(seeded_db)
    problems = refresh.quality_problems(seeded_db, {**s, "vetores": s["chunks"] - 1}, recall=0.5)
    assert any("vetores" in p for p in problems)
    assert any("recall" in p for p in problems)
