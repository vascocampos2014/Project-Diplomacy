from votoclaro_rag.fontes import resolver_fontes


def test_article_citation_gets_its_text(seeded_db):
    [f] = resolver_fontes("A dedução sobe [Projeto de Lei n.º 672, Artigo 2.º].")
    assert f["citacao"] == "Projeto de Lei n.º 672, Artigo 2.º"
    assert f["iniciativa_id"] == 1
    assert f["secao"] == "Artigo 2.º"
    assert "600 euros" in f["excerto"] and "Código do IRS" not in f["excerto"]
    assert f["votacao_id"] is None
    assert f["url_iniciativa"].endswith("BID=1")


def test_named_sections(seeded_db):
    [f] = resolver_fontes("[Projeto de Lei n.º 373, Exposição de motivos]")
    assert f["secao"] == "Exposição de motivos" and "botijas" in f["excerto"]


def test_vote_citations_point_at_the_vote(seeded_db):
    fontes = resolver_fontes(
        "Aprovado [Projeto de Lei n.º 672, votação de 2026-06-25] e depois "
        "[Projeto de Lei n.º 672, votação final global]. Chumbado [Projeto de Resolução n.º 259, votação]."
    )
    assert [f["votacao_id"] for f in fontes] == [10, 11, 13]


def test_bare_reference_has_no_section_or_vote(seeded_db):
    [f] = resolver_fontes("[Projeto de Lei n.º 672] e de novo [Projeto de Lei n.º 672]")
    assert f["secao"] is None and f["excerto"] is None and f["votacao_id"] is None


def test_unknown_initiatives_and_other_brackets_are_ignored(seeded_db):
    assert resolver_fontes("[Projeto de Lei n.º 9999, Artigo 1.º] [nota] sem fontes") == []


def test_only_parliament_document_links(seeded_db):
    seeded_db.execute("UPDATE iniciativas SET link_texto = 'http://app.parlamento.pt/webutils/docs/doc.pdf?x=1' WHERE id = 1")
    seeded_db.execute("UPDATE iniciativas SET link_texto = 'https://evil.example/doc.pdf' WHERE id = 2")
    seeded_db.commit()
    a, b = resolver_fontes("[Projeto de Lei n.º 672] [Projeto de Lei n.º 373]")
    assert a["url_documento"] == "https://app.parlamento.pt/webutils/docs/doc.pdf?x=1"
    assert b["url_documento"] is None
