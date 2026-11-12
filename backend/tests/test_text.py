from votoclaro_rag.text import _pack, chunk, clean

LETTERHEAD = "Palácio de São Bento, 1249-068 Lisboa | gabinete@partido.pt"


def test_clean_drops_repeated_letterhead_and_page_numbers():
    pages = [
        f"{LETTERHEAD}\nPrimeira frase da página um.\n1",
        f"{LETTERHEAD}\nSegunda frase.\n2",
        f"{LETTERHEAD}\nTerceira frase.\n3",
    ]
    text = clean(pages)
    assert LETTERHEAD not in text
    assert "\n1\n" not in f"\n{text}\n"
    assert "Primeira frase da página um." in text


def test_clean_keeps_letterhead_like_lines_in_short_docs():
    # With fewer than 3 pages "repeated" lines can't be told apart from content.
    assert "Linha" in clean(["Linha igual.\nTexto um.", "Linha igual.\nTexto dois."])


def test_clean_rejoins_wrapped_lines_and_hyphenation():
    text = clean(["A grave crise de natalidade é um dos maiores\ndesafios do país. O Estado deve apoiar as famí-\nlias numerosas."])
    assert "maiores desafios do país." in text
    assert "famílias numerosas" in text


def test_clean_breaks_paragraph_before_headings_and_list_items():
    text = clean(["Introdução sem ponto final\nArtigo 1.º\nObjeto\n1 - Primeiro número\n2 - Segundo número"])
    lines = text.split("\n")
    assert "Artigo 1.º" in lines
    assert any(ln.startswith("1 - Primeiro") for ln in lines)
    assert any(ln.startswith("2 - Segundo") for ln in lines)


def test_chunk_splits_by_article_and_normalises_section_names():
    text = "Texto inicial do preâmbulo.\nExposição de motivos:\nMotivos.\nArtigo 2º\nConteúdo dois.\nArtigo 3.°-A\nConteúdo três."
    sections = [c.secao for c in chunk(text)]
    assert sections == ["Preâmbulo", "Exposição de motivos", "Artigo 2.º", "Artigo 3.º-A"]


def test_chunk_ignores_quoted_article_references():
    # Amendments quote the article they change; that is not a new section.
    text = "Artigo 2.º\nO artigo passa a ter a seguinte redação:\n“Artigo 78.º-A\n1 – (…)”"
    assert [c.secao for c in chunk(text)] == ["Artigo 2.º"]


def test_chunk_respects_max_size_and_keeps_all_text():
    paras = [f"Frase número {i} com algum conteúdo para encher o parágrafo." for i in range(60)]
    chunks = chunk("\n".join(paras), max_chars=300, overlap=50)
    assert len(chunks) > 1
    assert all(len(c.texto) <= 300 + 70 for c in chunks)  # one paragraph may overflow by its own length
    joined = " ".join(c.texto for c in chunks)
    assert all(p in joined for p in paras)
    assert [c.seq for c in chunks] == list(range(len(chunks)))


def test_chunks_overlap():
    paras = [f"Parágrafo {i} " + "palavra " * 20 for i in range(10)]
    pieces = _pack(paras, max_chars=400, overlap=80)
    assert len(pieces) > 1
    # The start of each piece repeats the tail of the previous one.
    assert pieces[1].split("\n")[0][-20:] in pieces[0]


def test_pack_hard_splits_one_huge_paragraph():
    huge = ". ".join(f"Frase {i}" for i in range(400)) + "."
    pieces = _pack([huge], max_chars=500, overlap=50)
    assert len(pieces) > 3
    assert all(len(p) <= 500 for p in pieces)


def test_chunk_empty_text():
    assert chunk("") == []
