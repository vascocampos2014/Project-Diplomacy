"""Client for the openAR API (open data of the Assembleia da República)."""

import time
from collections.abc import Iterator

import httpx

from votoclaro_rag.config import LEGISLATURA, OPENAR_URL

ALLOWED_DOC_HOSTS = {"app.parlamento.pt", "www.parlamento.pt", "parlamento.pt"}
MAX_DOC_BYTES = 30 * 1024 * 1024  # the State Budget is the largest bill, at a few MB
MAX_REDIRECTS = 5
DOC_TIMEOUT = httpx.Timeout(120, connect=20)

# The API allows 100 requests per window; stay well below it.
_MIN_INTERVAL = 0.4


class OpenAR:
    def __init__(self) -> None:
        self._http = httpx.Client(timeout=30, follow_redirects=True, headers={"User-Agent": "votoclaro-rag"})
        self._last = 0.0

    def _get(self, url: str, **params) -> httpx.Response:
        for attempt in range(5):
            wait = _MIN_INTERVAL - (time.monotonic() - self._last)
            if wait > 0:
                time.sleep(wait)
            self._last = time.monotonic()
            res = self._http.get(url, params=params or None)
            if res.status_code == 429:
                time.sleep(float(res.headers.get("Retry-After", 2 ** attempt)))
                continue
            res.raise_for_status()
            return res
        res.raise_for_status()
        return res

    def votacoes(self, page_size: int = 200) -> Iterator[dict]:
        """All votes of the legislature, newest first."""
        page = 1
        while True:
            body = self._get(
                f"{OPENAR_URL}/votacoes", legislatura=LEGISLATURA, sort="desc", limit=page_size, page=page
            ).json()
            yield from body["data"]
            if page * page_size >= body["total"]:
                return
            page += 1

    def iniciativa(self, iniciativa_id: int) -> dict:
        return self._get(f"{OPENAR_URL}/iniciativas/{iniciativa_id}").json()

    def download(self, url: str) -> bytes:
        """Fetch a bill document from Parliament's own server.

        The URL comes from API data, so it is untrusted: every hop, redirects
        included, must be https on a Parliament host (otherwise a poisoned link
        or an open redirect could make this job fetch from anywhere), and the
        body is streamed and cut off at MAX_DOC_BYTES instead of being read
        whole first.
        """
        # The API links over http and the server redirects to https; go straight there.
        url = url.replace("http://", "https://", 1)
        for _ in range(MAX_REDIRECTS + 1):
            _check_doc_url(url)
            # Parliament's document server can take 30-60 s for one PDF.
            with self._http.stream("GET", url, follow_redirects=False, timeout=DOC_TIMEOUT) as res:
                if res.is_redirect:
                    url = str(res.url.join(res.headers.get("location", "")))
                    continue
                res.raise_for_status()
                declared = res.headers.get("content-length", "")
                if declared.isdigit() and int(declared) > MAX_DOC_BYTES:
                    raise ValueError(f"documento demasiado grande ({declared} bytes)")
                data = bytearray()
                for chunk in res.iter_bytes():
                    data += chunk
                    if len(data) > MAX_DOC_BYTES:
                        raise ValueError(f"documento demasiado grande (> {MAX_DOC_BYTES} bytes)")
                return bytes(data)
        raise ValueError("demasiados redirecionamentos")


def _check_doc_url(url: str) -> None:
    u = httpx.URL(url)
    if u.scheme != "https" or u.host not in ALLOWED_DOC_HOSTS:
        raise ValueError(f"documento fora de {sorted(ALLOWED_DOC_HOSTS)}: {url[:80]}")
