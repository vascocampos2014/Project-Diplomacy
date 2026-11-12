"""Client for the openAR API (open data of the Assembleia da República)."""

import time
from collections.abc import Iterator

import httpx

from votoclaro_rag.config import LEGISLATURA, OPENAR_URL

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
        # The API links over http and the server redirects to https; go straight there.
        return self._get(url.replace("http://", "https://", 1)).content
