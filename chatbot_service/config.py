from __future__ import annotations

import os
from dataclasses import dataclass


def _env(key: str, default: str | None = None) -> str | None:
    value = os.getenv(key)
    if value is None:
        return default
    value = value.strip()
    return value if value else default


@dataclass(frozen=True)
class Settings:
    # FastAPI
    service_name: str = _env("CHATBOT_SERVICE_NAME", "tnea-insight-chatbot") or "tnea-insight-chatbot"
    host: str = _env("CHATBOT_HOST", "0.0.0.0") or "0.0.0.0"
    port: int = int(_env("CHATBOT_PORT", "8000") or "8000")

    # Downstream “existing ML system” base URL (internal network)
    # Example when proxying to your Node server locally: http://127.0.0.1:3000
    # Example when pointing to a dedicated ML backend: http://ml-backend:8080
    tnea_api_base_url: str = _env("TNEA_API_BASE_URL", "http://127.0.0.1:3000") or "http://127.0.0.1:3000"

    # Paths expected by the prompt (can be overridden to match your real endpoints)
    # Defaults here are aligned to the current `TNEAInsight` Node server routes in this repo.
    # If you have a separate Python ML backend, override these via environment variables.
    predict_cutoff_path: str = _env("TNEA_PREDICT_CUTOFF_PATH", "/api/predict-cutoff") or "/api/predict-cutoff"
    recommend_colleges_path: str = _env("TNEA_RECOMMEND_COLLEGES_PATH", "/api/college-suggestions") or "/api/college-suggestions"
    compare_colleges_path: str = _env("TNEA_COMPARE_COLLEGES_PATH", "/api/compare-colleges") or "/api/compare-colleges"
    safe_target_dream_path: str = _env("TNEA_SAFE_TARGET_DREAM_PATH", "/api/safe-target-dream") or "/api/safe-target-dream"
    cutoff_history_path: str = _env("TNEA_CUTOFF_HISTORY_PATH", "/api/cutoff-history") or "/api/cutoff-history"

    # Intent models
    # - "baseline": TF-IDF + Logistic Regression (joblib pipeline)
    # - "bert": DistilBERT fine-tuned model (transformers)
    intent_backend: str = (_env("INTENT_BACKEND", "baseline") or "baseline").lower()
    baseline_intent_model_path: str = _env(
        "BASELINE_INTENT_MODEL_PATH",
        os.path.join(os.path.dirname(__file__), "intent_model", "artifacts", "baseline_intent.joblib"),
    ) or os.path.join(os.path.dirname(__file__), "intent_model", "artifacts", "baseline_intent.joblib")
    bert_intent_model_dir: str = _env(
        "BERT_INTENT_MODEL_DIR",
        os.path.join(os.path.dirname(__file__), "intent_model", "artifacts", "distilbert_intent"),
    ) or os.path.join(os.path.dirname(__file__), "intent_model", "artifacts", "distilbert_intent")

    # Entity extraction
    spacy_model_path: str | None = _env("SPACY_MODEL_PATH", None)

    # Session memory
    memory_ttl_seconds: int = int(_env("MEMORY_TTL_SECONDS", "3600") or "3600")
    memory_max_sessions: int = int(_env("MEMORY_MAX_SESSIONS", "5000") or "5000")

    # Behavior toggles
    enable_debug: bool = (_env("DEBUG", "false") or "false").lower() in {"1", "true", "yes", "y"}


settings = Settings()

