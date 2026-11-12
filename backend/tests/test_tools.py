import json

from votoclaro_rag.tools import PARTIDOS, find_votes, get_votes, run_tool, search_bills


def test_get_votes_by_id(seeded_db):
    r = get_votes(iniciativa_id=1)
    assert r["referencia"] == "Projeto de Lei n.º 672"
    assert [v["data"] for v in r["votacoes"]] == ["2026-06-25", "2026-10-28"]
    first = r["votacoes"][0]
    assert first["contra"] == ["PCP", "BE"] and first["abstencao"] == ["L"]


def test_get_votes_by_type_and_number(seeded_db):
    assert get_votes(tipo="projeto de lei", numero="373")["iniciativa_id"] == 2


def test_get_votes_unknown_or_missing_args(seeded_db):
    assert "erro" in get_votes(iniciativa_id=999)
    assert "erro" in get_votes()
    assert "erro" in get_votes(numero="9999")


def test_get_votes_ambiguous_number(seeded_db):
    seeded_db.execute("INSERT INTO iniciativas (id, tipo, tipo_desc, numero, titulo) VALUES (4, 'R', 'Projeto de Resolução', '672', 'Outra')")
    seeded_db.commit()
    assert "2 iniciativas" in get_votes(numero="672")["erro"]
    assert get_votes(tipo="Projeto de Resolução", numero="672")["iniciativa_id"] == 4


def test_unanimous_vote_with_empty_record_lists_every_party_in_favour(seeded_db):
    v = get_votes(iniciativa_id=2)["votacoes"][0]
    assert v["a_favor"] == PARTIDOS and v["contra"] == []


def test_find_votes_by_title_words(seeded_db):
    r = find_votes(palavras="portagens Xira")
    assert r["total"] == 1 and r["votacoes"][0]["referencia"] == "Projeto de Resolução n.º 259"


def test_find_votes_party_position_and_filter(seeded_db):
    r = find_votes(partido="BE")
    pos = {v["referencia"] + v["data"]: v["posicao_BE"] for v in r["votacoes"]}
    assert pos["Projeto de Lei n.º 6722026-06-25"] == "contra"
    assert pos["Projeto de Lei n.º 6722026-10-28"] == "a_favor"
    contra = find_votes(partido="BE", posicao="contra")
    assert [v["data"] for v in contra["votacoes"]] == ["2026-06-25"]


def test_find_votes_result_and_dates(seeded_db):
    assert find_votes(resultado="Rejeitado")["total"] == 1
    assert find_votes(desde="2026-10-01")["total"] == 2
    assert find_votes(desde="2026-05-01", ate="2026-07-01")["total"] == 1


def test_find_votes_limit_is_clamped(seeded_db):
    assert len(find_votes(limite=1)["votacoes"]) == 1
    assert find_votes(limite=1)["total"] == 4
    assert len(find_votes(limite=0)["votacoes"]) == 1  # clamped to at least 1
    assert len(find_votes(limite=10_000)["votacoes"]) == 4


def test_find_votes_like_wildcards_are_data(seeded_db):
    # "%" in the user's words must not turn into "match everything".
    assert find_votes(palavras="%%%")["total"] == 4  # too short to be a filter: ignored
    assert find_votes(palavras="zzz_inexistente")["total"] == 0


def test_search_bills_shape(seeded_db):
    r = search_bills("gás engarrafado", k=2)
    e = r["excertos"][0]
    assert set(e) == {"iniciativa_id", "referencia", "titulo", "secao", "texto"}


def test_search_bills_clamps_k(seeded_db):
    assert len(search_bills("IRS", k=0)["excertos"]) == 1
    assert len(search_bills("IRS gás portagens", k=500)["excertos"]) <= 10


def test_run_tool_returns_json_and_handles_errors(seeded_db):
    assert json.loads(run_tool("get_votes", {"iniciativa_id": 1}))["iniciativa_id"] == 1
    assert "desconhecida" in json.loads(run_tool("drop_tables", {}))["erro"]
    assert "inválidos" in json.loads(run_tool("get_votes", {"bogus": 1}))["erro"]


def test_find_votes_underscore_is_literal(seeded_db):
    seeded_db.execute("INSERT INTO iniciativas (id, tipo, tipo_desc, numero, titulo) VALUES (5, 'J', 'Projeto de Lei', '5', 'abcXdef')")
    seeded_db.execute("INSERT INTO votacoes (id, iniciativa_id, data, resultado, unanime, a_favor, contra, abstencao, ausencias) VALUES (50, 5, '2026-01-01', 'Aprovado', 0, '[]', '[]', '[]', '[]')")
    seeded_db.commit()
    assert find_votes(palavras="abcXdef")["total"] == 1
    assert find_votes(palavras="abc_def")["total"] == 0  # "_" must not match "X"
