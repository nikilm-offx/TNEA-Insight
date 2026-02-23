from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

from config import settings


@dataclass(frozen=True)
class IntegrationResult:
    ok: bool
    data: dict[str, Any] | None = None
    error: str | None = None
    status_code: int | None = None


class TneaApiClient:
    """
    Internal REST client to your existing ML/model APIs.
    This service must NOT re-implement model logic; it calls your existing endpoints.
    """

    def __init__(self, base_url: str | None = None, timeout_seconds: float = 15.0):
        self.base_url = (base_url or settings.tnea_api_base_url).rstrip("/")
        self.timeout_seconds = timeout_seconds

    async def _post(self, path: str, json: dict[str, Any], headers: dict[str, str] | None = None) -> IntegrationResult:
        url = f"{self.base_url}{path}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                r = await client.post(url, json=json, headers=headers)
            if r.status_code >= 400:
                return IntegrationResult(ok=False, error=r.text, status_code=r.status_code)
            return IntegrationResult(ok=True, data=r.json(), status_code=r.status_code)
        except Exception as e:
            return IntegrationResult(ok=False, error=str(e))

    async def _get(self, path: str, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> IntegrationResult:
        url = f"{self.base_url}{path}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                r = await client.get(url, params=params, headers=headers)
            if r.status_code >= 400:
                return IntegrationResult(ok=False, error=r.text, status_code=r.status_code)
            return IntegrationResult(ok=True, data=r.json(), status_code=r.status_code)
        except Exception as e:
            return IntegrationResult(ok=False, error=str(e))

    async def predict_cutoff(self, payload: dict[str, Any], headers: dict[str, str] | None = None) -> IntegrationResult:
        return await self._post(settings.predict_cutoff_path, json=payload, headers=headers)

    async def recommend_colleges(self, payload: dict[str, Any], headers: dict[str, str] | None = None) -> IntegrationResult:
        # Adapter: this repo’s Node backend expects {marks, category, preferences} on /api/college-suggestions
        if settings.recommend_colleges_path.rstrip("/") == "/api/college-suggestions":
            adapted = {
                "marks": payload.get("cutoff") if payload.get("cutoff") is not None else payload.get("marks"),
                "category": payload.get("category"),
                "preferences": payload.get("branch") or payload.get("preferences"),
            }
            return await self._post(settings.recommend_colleges_path, json=adapted, headers=headers)

        return await self._post(settings.recommend_colleges_path, json=payload, headers=headers)

    async def compare_colleges(self, payload: dict[str, Any], headers: dict[str, str] | None = None) -> IntegrationResult:
        return await self._post(settings.compare_colleges_path, json=payload, headers=headers)

    async def safe_target_dream(self, payload: dict[str, Any], headers: dict[str, str] | None = None) -> IntegrationResult:
        return await self._post(settings.safe_target_dream_path, json=payload, headers=headers)

    async def cutoff_history(self, params: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> IntegrationResult:
        return await self._get(settings.cutoff_history_path, params=params, headers=headers)

