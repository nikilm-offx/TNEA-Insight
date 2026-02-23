from __future__ import annotations

from typing import Any, Literal

from fastapi import FastAPI, Header
from pydantic import BaseModel, Field

from config import settings
from decision_engine import DecisionEngine
from integration_layer import TneaApiClient
from intent_model.baseline import BaselineIntentClassifier
from intent_model.bert import BertIntentClassifier
from memory_store import MemoryStore
from ner_model.entity_extractor import EntityExtractor
from utils import normalize_whitespace


SUPPORTED_INTENTS = [
    "college_recommendation",
    "cutoff_prediction",
    "college_comparison",
    "safe_target_dream_query",
    "counselling_process",
    "document_verification",
    "seat_trend_analysis",
    "greeting",
    "goodbye",
    "fallback_unknown",
]


class ChatRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    session_id: str | None = None
    language: Literal["en", "ta"] = "en"


class ChatResponse(BaseModel):
    intent: str
    confidence: float
    entities: dict[str, Any]
    results: list[dict[str, Any]] = []
    response_text: str


def _simple_rules_intent(text: str) -> str | None:
    t = text.lower()
    if any(k in t for k in ["hi", "hello", "hey", "vanakkam", "வணக்கம்"]):
        return "greeting"
    if any(k in t for k in ["bye", "goodbye", "thanks", "thank you", "நன்றி"]):
        return "goodbye"
    if "compare" in t or "vs" in t:
        return "college_comparison"
    if any(k in t for k in ["recommend", "suggest", "best college", "which college"]):
        return "college_recommendation"
    if any(k in t for k in ["predict", "prediction", "what cutoff", "cutoff for"]):
        return "cutoff_prediction"
    if any(k in t for k in ["safe", "target", "dream"]):
        return "safe_target_dream_query"
    if any(k in t for k in ["counselling", "counseling", "choice filling", "allotment", "round"]):
        return "counselling_process"
    if any(k in t for k in ["document", "certificate", "verification"]):
        return "document_verification"
    if any(k in t for k in ["trend", "last year", "previous year", "history"]):
        return "seat_trend_analysis"
    return None


def create_app() -> FastAPI:
    app = FastAPI(title=settings.service_name)

    memory = MemoryStore(max_sessions=settings.memory_max_sessions, ttl_seconds=settings.memory_ttl_seconds)
    extractor = EntityExtractor(spacy_model_path=settings.spacy_model_path)
    api_client = TneaApiClient()
    engine = DecisionEngine(memory=memory, extractor=extractor, api_client=api_client)

    baseline = BaselineIntentClassifier(settings.baseline_intent_model_path)
    bert = BertIntentClassifier(settings.bert_intent_model_dir)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.service_name}

    @app.post("/chat", response_model=ChatResponse)
    async def chat(
        req: ChatRequest,
        cookie: str | None = Header(default=None),
        authorization: str | None = Header(default=None),
    ) -> dict[str, Any]:
        message = normalize_whitespace(req.message)

        # 1) quick rule intent (very fast + robust)
        rule_intent = _simple_rules_intent(message)

        # 2) model intent
        intent = "fallback_unknown"
        confidence = 0.25
        try:
            if settings.intent_backend == "bert":
                pred = bert.predict(message)
            else:
                pred = baseline.predict(message)
            intent = pred.intent
            confidence = pred.confidence
        except Exception:
            # If model artifacts are missing, fall back to rules
            pass

        # 3) Blend: if model is low-confidence, use rule intent if available
        if confidence < 0.55 and rule_intent is not None:
            intent = rule_intent
            confidence = max(confidence, 0.6)

        if intent not in SUPPORTED_INTENTS:
            intent = "fallback_unknown"

        downstream_headers: dict[str, str] | None = None
        if cookie or authorization:
            downstream_headers = {}
            if cookie:
                downstream_headers["cookie"] = cookie
            if authorization:
                downstream_headers["authorization"] = authorization

        result = await engine.handle(
            user_id=req.user_id,
            session_id=req.session_id,
            message=message,
            intent=intent,
            intent_confidence=confidence,
            language=req.language,
            downstream_headers=downstream_headers,
        )
        return result

    return app


app = create_app()

