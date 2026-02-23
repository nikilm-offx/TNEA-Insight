from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from cachetools import TTLCache


@dataclass
class SessionState:
    cutoff_score: float | None = None
    category: str | None = None
    preferred_branch: str | None = None
    location: str | None = None
    gender_quota: str | None = None
    first_graduate_quota: bool | None = None
    last_intent: str | None = None
    # free-form bag for future signals
    extras: dict[str, Any] = field(default_factory=dict)


class MemoryStore:
    """
    Session memory keyed by (user_id, session_id).
    - In production you can swap this for Redis without changing the interface.
    """

    def __init__(self, max_sessions: int, ttl_seconds: int):
        self._cache: TTLCache[str, SessionState] = TTLCache(maxsize=max_sessions, ttl=ttl_seconds)

    @staticmethod
    def _key(user_id: str, session_id: str | None) -> str:
        sid = session_id or "default"
        return f"{user_id}::{sid}"

    def get(self, user_id: str, session_id: str | None = None) -> SessionState:
        key = self._key(user_id, session_id)
        state = self._cache.get(key)
        if state is None:
            state = SessionState()
            self._cache[key] = state
        return state

    def update(self, user_id: str, session_id: str | None, **kwargs) -> SessionState:
        state = self.get(user_id, session_id)
        for k, v in kwargs.items():
            if hasattr(state, k) and v is not None:
                setattr(state, k, v)
        return state

