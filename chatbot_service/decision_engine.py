from __future__ import annotations

from typing import Any

from integration_layer import TneaApiClient
from memory_store import MemoryStore
from ner_model.entity_extractor import EntityExtractor
from response_generator import (
    generate_college_recommendation_response,
    generate_faq_response,
)
from utils import canon_branch, canon_category, canon_location, suggest_branches


class DecisionEngine:
    def __init__(self, memory: MemoryStore, extractor: EntityExtractor, api_client: TneaApiClient):
        self.memory = memory
        self.extractor = extractor
        self.api = api_client

    async def handle(
        self,
        *,
        user_id: str,
        session_id: str | None,
        message: str,
        intent: str,
        intent_confidence: float,
        language: str = "en",
        downstream_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        # Extract entities from message and merge with memory
        ents = self.extractor.extract(message)
        state = self.memory.get(user_id, session_id)

        # Update memory (only when new info exists)
        self.memory.update(
            user_id,
            session_id,
            cutoff_score=ents.cutoff_score,
            category=ents.category,
            preferred_branch=ents.branch,
            location=ents.district,
            gender_quota=ents.gender_quota,
            first_graduate_quota=ents.first_graduate_quota,
            last_intent=intent,
        )
        state = self.memory.get(user_id, session_id)

        # Build “effective” entities from message+memory
        effective = {
            # Follow the API spec naming expected by the frontend/chat UI
            "cutoff": state.cutoff_score,
            "category": state.category,
            "branch": state.preferred_branch,
            "location": state.location,
            "college_name": ents.college_name,
            "college_type": ents.college_type,
            "round_number": ents.round_number,
            "gender_quota": state.gender_quota,
            "first_graduate_quota": state.first_graduate_quota,
        }

        # Validation and clarification
        if effective["branch"] is not None and canon_branch(str(effective["branch"])) is None:
            return {
                "intent": "fallback_unknown",
                "confidence": float(intent_confidence),
                "entities": effective,
                "results": [],
                "response_text": (
                    "I couldn’t recognize that branch. Try one of these: "
                    + ", ".join(suggest_branches())
                    + "."
                ),
            }

        if intent == "college_recommendation":
            if effective["cutoff"] is None or effective["category"] is None:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "Could you please provide your cutoff score and community category (OC/BC/BCM/MBC/SC/ST/SCA)?",
                }

            payload = {
                "cutoff": float(effective["cutoff"]),
                "category": canon_category(effective["category"]),
                "branch": canon_branch(effective["branch"]) if effective["branch"] else None,
                "location": canon_location(effective["location"]) if effective["location"] else None,
                "gender_quota": effective["gender_quota"],
                "first_graduate_quota": effective["first_graduate_quota"],
                "round": effective["round_number"],
                "college_type": effective["college_type"],
            }

            rec = await self.api.recommend_colleges(payload, headers=downstream_headers)
            if not rec.ok:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "I couldn’t reach the recommendation engine right now. Please try again in a moment.",
                    "downstream_error": rec.error,
                }

            # Optional: attach last year cutoff by calling cutoff history if available
            last_year_cutoff = None
            hist = await self.api.cutoff_history(params=None, headers=downstream_headers)
            if hist.ok and isinstance(hist.data, list) and hist.data:
                # best-effort: take first record’s generalCutoff if present
                first = hist.data[0]
                try:
                    last_year_cutoff = float(first.get("generalCutoff")) if first.get("generalCutoff") is not None else None
                except Exception:
                    last_year_cutoff = None

            data = rec.data or {}
            recommendations = data.get("results") if isinstance(data, dict) else None
            if recommendations is None:
                # accept array response
                recommendations = data if isinstance(data, list) else []

            gen = generate_college_recommendation_response(
                cutoff_score=float(effective["cutoff"]),
                category=str(effective["category"]),
                branch=payload.get("branch"),
                location=payload.get("location"),
                recommendations=recommendations or [],
                last_year_cutoff=last_year_cutoff,
            )
            return {
                "intent": intent,
                "confidence": float(intent_confidence),
                "entities": effective,
                "results": gen.results,
                "response_text": gen.response_text,
            }

        if intent == "cutoff_prediction":
            # For cutoff prediction we need a marks/cutoff input; reuse cutoff_score as marks if user uses “cutoff”
            if effective["cutoff"] is None or effective["category"] is None:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "Please share your cutoff/marks and category, and (if possible) the college + branch you want to predict for.",
                }
            payload = {
                "marks": float(effective["cutoff"]),
                "category": canon_category(effective["category"]),
                "collegeId": None,
                "branchId": None,
            }
            pred = await self.api.predict_cutoff(payload, headers=downstream_headers)
            if not pred.ok:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "I couldn’t reach the cutoff prediction engine right now. Please try again.",
                    "downstream_error": pred.error,
                }
            return {
                "intent": intent,
                "confidence": float(intent_confidence),
                "entities": effective,
                "results": [pred.data] if pred.data else [],
                "response_text": f"Here’s the cutoff prediction output from the model: {pred.data}",
            }

        if intent in {"counselling_process", "document_verification", "seat_trend_analysis", "greeting", "goodbye"}:
            return {
                "intent": intent,
                "confidence": float(intent_confidence),
                "entities": effective,
                "results": [],
                "response_text": generate_faq_response(intent, language=language),
            }

        if intent == "college_comparison":
            if not ents.college_name:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "Which two colleges do you want to compare? (Example: “Compare PSG Tech vs SSN”)",
                }
            cmp_res = await self.api.compare_colleges({"query": message}, headers=downstream_headers)
            if not cmp_res.ok:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "I couldn’t reach the college comparison module right now.",
                    "downstream_error": cmp_res.error,
                }
            return {
                "intent": intent,
                "confidence": float(intent_confidence),
                "entities": effective,
                "results": [cmp_res.data] if cmp_res.data else [],
                "response_text": "Here’s the comparison result.",
            }

        if intent == "safe_target_dream_query":
            # Usually derived from recommendation; but allow direct call
            if effective["cutoff"] is None or effective["category"] is None:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "Share your cutoff and category, and the college/branch you’re aiming for, and I’ll classify it as Safe/Target/Dream.",
                }
            res = await self.api.safe_target_dream({"query": message, "entities": effective}, headers=downstream_headers)
            if not res.ok:
                return {
                    "intent": intent,
                    "confidence": float(intent_confidence),
                    "entities": effective,
                    "results": [],
                    "response_text": "I couldn’t reach the Safe/Target/Dream classifier right now.",
                    "downstream_error": res.error,
                }
            return {
                "intent": intent,
                "confidence": float(intent_confidence),
                "entities": effective,
                "results": [res.data] if res.data else [],
                "response_text": "Here’s the Safe/Target/Dream output.",
            }

        # fallback_unknown
        return {
            "intent": "fallback_unknown",
            "confidence": float(intent_confidence),
            "entities": effective,
            "results": [],
            "response_text": "I want to help—are you looking for cutoff prediction, college recommendations, college comparison, or counselling guidance? Please share your cutoff + category to get started.",
        }

