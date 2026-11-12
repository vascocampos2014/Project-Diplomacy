import pytest

from votoclaro_rag.search import search


def refs(hits):
    return [h.referencia for h in hits]


@pytest.mark.parametrize("mode", ["hybrid", "vector", "keyword"])
def test_finds_the_right_bill(seeded_db, mode):
    hits = search("IVA do gás engarrafado", k=3, mode=mode)
    assert hits and hits[0].referencia == "Projeto de Lei n.º 373"


def test_hits_carry_bill_metadata(seeded_db):
    h = search("dedução IRS terceiro filho", k=1)[0]
    assert h.referencia == "Projeto de Lei n.º 672"
    assert "IRS" in h.titulo
    assert h.secao and h.texto and h.score > 0


def test_max_per_bill_caps_passages(seeded_db):
    hits = search("IRS dedução filho natalidade famílias", k=10, max_per_bill=1)
    assert len(refs(hits)) == len(set(refs(hits)))


def test_k_limits_results(seeded_db):
    assert len(search("portagens", k=1)) == 1


@pytest.mark.parametrize("query", ['"', "AND OR NOT", "IRS*", "(gás)", "a' OR 1=1 --", "NEAR(x y)"])
def test_fts_syntax_in_user_input_does_not_crash(seeded_db, query):
    search(query, k=3)  # must not raise sqlite3.OperationalError


def test_query_without_usable_terms_returns_vector_hits_only(seeded_db):
    assert search("a e o", k=2, mode="keyword") == []
    assert len(search("a e o", k=2, mode="hybrid")) <= 2


def test_empty_index_returns_nothing(tmp_db):
    assert search("qualquer coisa") == []
