from __future__ import annotations

import re
from typing import Iterable


CATEGORIES = {"OC", "BC", "BCM", "MBC", "SC", "ST", "SCA"}
COLLEGE_TYPES = {"government", "private", "autonomous"}

# Expand as needed; used for validation + canonicalization
BRANCH_ALIASES = {
    "CSE": {"cse", "computer science", "computer science and engineering", "cs"},
    "ECE": {"ece", "electronics", "electronics and communication", "electronics and communication engineering"},
    "IT": {"it", "information technology"},
    "AI&DS": {"ai", "aids", "ai&ds", "artificial intelligence", "artificial intelligence and data science"},
    "MECH": {"mech", "mechanical", "mechanical engineering"},
    "CIVIL": {"civil", "civil engineering"},
}

DISTRICT_ALIASES = {
    "chennai": {"chennai", "madras"},
    "coimbatore": {"coimbatore", "kovai"},
    "madurai": {"madurai"},
    "tiruchirappalli": {"trichy", "tiruchirappalli"},
    "salem": {"salem"},
}

GENDER_ALIASES = {
    "female": {"female", "girls", "women"},
    "male": {"male", "boys", "men"},
}


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def canon_category(text: str | None) -> str | None:
    if not text:
        return None
    t = text.strip().upper()
    if t in CATEGORIES:
        return t
    return None


def canon_branch(text: str | None) -> str | None:
    if not text:
        return None
    t = text.strip().lower()
    for canon, aliases in BRANCH_ALIASES.items():
        if t == canon.lower() or t in aliases:
            return canon
    # Accept direct shortcodes like "EEE", "CSBS" etc as pass-through
    if re.fullmatch(r"[A-Z]{2,6}(&[A-Z]{1,4})?", text.strip().upper()):
        return text.strip().upper()
    return None


def canon_location(text: str | None) -> str | None:
    if not text:
        return None
    t = text.strip().lower()
    for canon, aliases in DISTRICT_ALIASES.items():
        if t == canon or t in aliases:
            return canon.title()
    # keep as provided if looks like a place token
    if re.fullmatch(r"[A-Za-z][A-Za-z .'-]{1,40}", text.strip()):
        return text.strip()
    return None


def canon_college_type(text: str | None) -> str | None:
    if not text:
        return None
    t = text.strip().lower()
    if t in COLLEGE_TYPES:
        return t.title()
    if "gov" in t:
        return "Government"
    if "auto" in t:
        return "Autonomous"
    if "priv" in t:
        return "Private"
    return None


def detect_first_graduate(text: str) -> bool | None:
    t = (text or "").lower()
    if any(k in t for k in ["first graduate", "1st graduate", "fg quota", "first-gen", "first generation"]):
        return True
    if any(k in t for k in ["not first graduate", "no first graduate"]):
        return False
    return None


def suggest_branches() -> list[str]:
    return sorted(BRANCH_ALIASES.keys())


def safe_float(value) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except Exception:
        return None


def pct(x: float) -> int:
    return int(round(max(0.0, min(1.0, x)) * 100))

