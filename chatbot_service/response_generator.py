from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from utils import pct


@dataclass(frozen=True)
class GeneratedResponse:
    response_text: str
    results: list[dict[str, Any]]


def _label_from_probability(p: float) -> str:
    if p >= 0.75:
        return "Safe"
    if p >= 0.5:
        return "Target"
    return "Dream"


def generate_college_recommendation_response(
    cutoff_score: float,
    category: str,
    branch: str | None,
    location: str | None,
    recommendations: list[dict[str, Any]],
    last_year_cutoff: float | None = None,
) -> GeneratedResponse:
    results: list[dict[str, Any]] = []
    for rec in recommendations:
        # Accept both {probability} and {matchScore} style payloads from downstream services
        prob = rec.get("probability")
        if prob is None:
            match_score = rec.get("matchScore")
            if isinstance(match_score, (int, float)):
                prob = float(match_score) / 100.0
        if prob is None:
            prob = 0.5

        results.append(
            {
                "college": rec.get("college") or rec.get("name") or rec.get("collegeName") or "Unknown College",
                "branch": rec.get("branch") or rec.get("branchName") or branch,
                "location": rec.get("location") or location,
                "probability": round(float(prob), 4),
                "probability_percent": pct(float(prob)),
                "classification": rec.get("classification") or _label_from_probability(float(prob)),
                "last_year_cutoff": rec.get("last_year_cutoff") or last_year_cutoff,
            }
        )

    last_year_phrase = ""
    if last_year_cutoff is not None:
        diff = cutoff_score - last_year_cutoff
        last_year_phrase = f" Last year’s cutoff was ~{last_year_cutoff:.1f} (you are {diff:+.1f} vs last year)."

    loc_phrase = f" in {location}" if location else ""
    branch_phrase = f" for {branch}" if branch else ""
    text = (
        f"Based on your {cutoff_score:.1f} cutoff ({category}){branch_phrase}{loc_phrase}, "
        f"here are the best-matching colleges with probability and Safe/Target/Dream labels."
        f"{last_year_phrase} If you tell me 2–3 preferred colleges, I can refine the list."
    )
    return GeneratedResponse(response_text=text, results=results)


def generate_faq_response(intent: str, language: str = "en") -> str:
    faqs_en = {
        "counselling_process": "TNEA counselling generally includes registration, certificate upload, rank list, choice filling, seat allotment by rounds, and reporting. Tell me your round and category for more specific guidance.",
        "document_verification": "For document verification, keep your original certificates (10th/12th), community certificate, nativity, income (if applicable), first graduate (if applicable), and ID proof ready. Tell me your category/quota to list exact docs.",
        "seat_trend_analysis": "Seat trends depend on college, branch, category, and rounds. Share your cutoff + category + branch + location (and any colleges) and I’ll summarize trend patterns.",
        "greeting": "Hi! Ask me about cutoff prediction, college recommendations, comparisons, or counselling steps.",
        "goodbye": "Good luck with your TNEA counselling. If you share your cutoff, category and preferred branch, I can shortlist colleges quickly.",
    }
    faqs_ta = {
        "greeting": "வணக்கம்! கட்ஆஃப் கணிப்பு, கல்லூரி பரிந்துரை, ஒப்பீடு, ஆலோசனை செயல்முறை குறித்து கேளுங்கள்.",
        "goodbye": "வாழ்த்துகள்! உங்கள் கட்ஆஃப், சமூக வகை மற்றும் விருப்ப கிளையை சொன்னால் நான் கல்லூரிகளை விரைவாக பரிந்துரைக்க முடியும்.",
    }
    if language == "ta":
        return faqs_ta.get(intent, faqs_en.get(intent, "Please share a bit more detail so I can help."))
    return faqs_en.get(intent, "Please share a bit more detail so I can help.")

