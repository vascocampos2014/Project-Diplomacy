from votoclaro_rag.agent import tidy_answer
from votoclaro_rag.evals import _check


def test_tidy_normalises_gpt_oss_citations_and_spaces():
    raw = "O PS abstém‑se【Projeto de Lei n.º 511, votação de 2026-09-30】."
    out = tidy_answer(raw)
    assert out == "O PS abstém-se[Projeto de Lei n.º 511, votação de 2026-09-30]."
    assert _check({"must": ["absten|abstev|abst[eé]m"], "cite": True}, out) == {
        "contém /absten|abstev|abst[eé]m/": True,
        "cita fonte": True,
    }


def test_fase_votacao_labels_stages():
    from votoclaro_rag.tools import fase_votacao

    assert fase_votacao(None) == "generalidade ou votação única"
    assert fase_votacao("Texto Final, apresentado pela Comissão de Saúde") == "votação final global"
    assert fase_votacao("Requerimento oral, apresentado pelo PSD") == "requerimento (procedimental)"
    assert fase_votacao("Votação relativa ao artigo n.º 2 do PJL n.º 172") == "especialidade"


def test_double_brackets_become_single():
    assert tidy_answer("absteve-se[[Projeto de Lei n.º 511, votação na generalidade]].") == (
        "absteve-se[Projeto de Lei n.º 511, votação na generalidade]."
    )
