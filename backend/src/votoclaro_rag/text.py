"""Turn a bill PDF into clean text, then into passages (chunks) for retrieval."""

import io
import re
from collections import Counter
from dataclasses import dataclass

import pypdf

# ---------------------------------------------------------------- extraction


def extract_pdf(data: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(data))
    pages = [(p.extract_text() or "") for p in reader.pages]
    return clean(pages)


def clean(pages: list[str]) -> str:
    """Drop page furniture and re-join lines broken by the PDF layout."""
    page_lines = [[ln.strip() for ln in p.splitlines()] for p in pages]

    # Party letterheads and footers repeat on every page: drop any line that
    # appears on at least half the pages (only meaningful for 3+ pages).
    repeated: set[str] = set()
    if len(pages) >= 3:
        counts = Counter(ln for lines in page_lines for ln in set(lines) if ln)
        repeated = {ln for ln, n in counts.items() if n >= len(pages) / 2}

    lines = [
        ln
        for lines in page_lines
        for ln in lines
        if ln and ln not in repeated and not re.fullmatch(r"\d{1,3}", ln)  # bare page numbers
    ]

    # A line that ends a sentence, or is followed by a heading / list item,
    # closes a paragraph; anything else continues onto the next line.
    paras: list[str] = []
    buf = ""
    for i, ln in enumerate(lines):
        buf = f"{buf} {ln}" if buf else ln
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        if (
            not nxt
            or re.search(r"[.:;!?”\"»)]$", ln)
            or _is_heading(ln)
            or _is_heading(nxt)
            or re.match(r"^(\d+\s*[-–.]|[a-z]\)|[ivx]+\))\s", nxt)
        ):
            paras.append(buf)
            buf = ""
    text = "\n".join(paras)
    text = re.sub(r"(\w)-\s+(\w)", r"\1\2", text)  # hyphenation at line ends
    return re.sub(r"[ \t]+", " ", text).strip()


_HEADING = re.compile(
    r"^(Artigo\s+\d+\.?\s*[ºo°]?(-[A-Z])?|Exposição de motivos|Nota justificativa|CAPÍTULO\s+[IVXL]+|SECÇÃO\s+[IVXL]+)\b",
    re.IGNORECASE,
)


def _is_heading(line: str) -> bool:
    return bool(_HEADING.match(line)) and len(line) < 80


# ---------------------------------------------------------------- chunking


@dataclass
class Chunk:
    seq: int
    secao: str
    texto: str


def chunk(text: str, max_chars: int = 1200, overlap: int = 200) -> list[Chunk]:
    """Split by section (preamble, each article), then pack paragraphs up to
    max_chars. Long sections are split with some overlap so a sentence near a
    boundary is still retrievable with its context."""
    sections: list[tuple[str, list[str]]] = [("Preâmbulo", [])]
    for para in text.split("\n"):
        if _is_heading(para):
            sections.append((_section_name(para), []))
        else:
            sections[-1][1].append(para)

    chunks: list[Chunk] = []
    for name, paras in sections:
        body = "\n".join(paras).strip()
        if not body:
            continue
        for piece in _pack(paras, max_chars, overlap):
            chunks.append(Chunk(seq=len(chunks), secao=name, texto=piece))
    return chunks


def _section_name(heading: str) -> str:
    m = re.match(r"Artigo\s+(\d+)\.?\s*[ºo°]?(-[A-Z])?", heading, re.IGNORECASE)
    if m:
        return f"Artigo {m.group(1)}.º{m.group(2) or ''}"  # "Artigo 2º" / "Artigo 2.°" -> "Artigo 2.º"
    return heading.strip().rstrip(":").capitalize()


def _pack(paras: list[str], max_chars: int, overlap: int) -> list[str]:
    pieces: list[str] = []
    cur = ""
    for p in paras:
        while len(p) > max_chars:  # a single huge paragraph: hard split on sentence ends
            cut = p.rfind(". ", 0, max_chars)
            cut = cut + 1 if cut > max_chars // 2 else max_chars
            pieces.extend([cur] if cur else [])
            cur = ""
            pieces.append(p[:cut].strip())
            p = p[max(cut - overlap, 0):].strip()
        if cur and len(cur) + len(p) + 1 > max_chars:
            pieces.append(cur)
            tail = cur[-overlap:]
            cur = tail[tail.find(" ") + 1:] + "\n" + p if overlap else p
        else:
            cur = f"{cur}\n{p}" if cur else p
    if cur.strip():
        pieces.append(cur)
    return [x.strip() for x in pieces if x.strip()]
