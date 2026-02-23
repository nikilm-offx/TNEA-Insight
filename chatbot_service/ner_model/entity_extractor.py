from __future__ import annotations

import re
from dataclasses import dataclass, asdict

import spacy
from spacy.language import Language
from spacy.pipeline import EntityRuler

from utils import (
    canon_branch,
    canon_category,
    canon_college_type,
    canon_location,
    detect_first_graduate,
)


SUPPORTED_BRANCH_HINTS = [
    "cse",
    "ece",
    "it",
    "aids",
    "ai&ds",
    "mech",
    "civil",
]


@dataclass
class ExtractedEntities:
    cutoff_score: float | None = None
    category: str | None = None
    branch: str | None = None
    district: str | None = None
    college_name: str | None = None
    college_type: str | None = None
    round_number: int | None = None
    gender_quota: str | None = None
    first_graduate_quota: bool | None = None

    def to_dict(self) -> dict:
        return asdict(self)


class EntityExtractor:
    """
    Hybrid entity extraction:
    - Regex for numeric cutoff
    - spaCy EntityRuler for categories/branches/locations hints
    - Post-processing canonicalization
    """

    CUTOFF_RE = re.compile(r"(?<!\d)(\d{2,3}(?:\.\d{1,2})?)(?!\d)\s*(?:cutoff|cut off|mark|marks)?", re.I)
    ROUND_RE = re.compile(r"(?:round|rnd)\s*(1|2|3)\b", re.I)
    CATEGORY_RE = re.compile(r"\b(OC|BCM|BC|MBC|SC|ST|SCA)\b", re.I)
    # gender hints
    FEMALE_RE = re.compile(r"\b(female|girls|women)\b", re.I)
    MALE_RE = re.compile(r"\b(male|boys|men)\b", re.I)
    # college type hints
    GOVT_RE = re.compile(r"\b(govt|government)\b", re.I)
    AUTO_RE = re.compile(r"\b(autonomous|auto)\b", re.I)
    PRIV_RE = re.compile(r"\b(private)\b", re.I)

    def __init__(self, spacy_model_path: str | None = None):
        self._nlp: Language = self._build_nlp(spacy_model_path)

    def _build_nlp(self, spacy_model_path: str | None) -> Language:
        if spacy_model_path:
            return spacy.load(spacy_model_path)
        nlp = spacy.blank("en")
        ruler: EntityRuler = nlp.add_pipe("entity_ruler")  # type: ignore[assignment]
        patterns = []

        # category patterns
        for cat in ["OC", "BC", "BCM", "MBC", "SC", "ST", "SCA"]:
            patterns.append({"label": "CATEGORY", "pattern": [{"TEXT": {"REGEX": f"^{cat}$"}}]})

        # branch patterns (simple hints)
        for b in ["CSE", "ECE", "IT", "AI&DS", "MECH", "CIVIL"]:
            patterns.append({"label": "BRANCH", "pattern": b})
        patterns.append({"label": "BRANCH", "pattern": [{"LOWER": "aids"}]})
        patterns.append({"label": "BRANCH", "pattern": [{"LOWER": "ai"}, {"TEXT": "&"}, {"LOWER": "ds"}]})

        # basic location hints (can be expanded)
        for loc in ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"]:
            patterns.append({"label": "LOCATION", "pattern": loc})

        ruler.add_patterns(patterns)
        return nlp

    def extract(self, text: str) -> ExtractedEntities:
        t = text or ""
        doc = self._nlp(t)

        out = ExtractedEntities()

        # Regex first: cutoff, category, round
        m = self.CUTOFF_RE.search(t)
        if m:
            try:
                out.cutoff_score = float(m.group(1))
            except Exception:
                pass

        m = self.CATEGORY_RE.search(t)
        if m:
            out.category = canon_category(m.group(1))

        m = self.ROUND_RE.search(t)
        if m:
            out.round_number = int(m.group(1))

        # Gender quota
        if self.FEMALE_RE.search(t):
            out.gender_quota = "female"
        elif self.MALE_RE.search(t):
            out.gender_quota = "male"

        # First graduate
        out.first_graduate_quota = detect_first_graduate(t)

        # College type
        if self.GOVT_RE.search(t):
            out.college_type = "Government"
        elif self.AUTO_RE.search(t):
            out.college_type = "Autonomous"
        elif self.PRIV_RE.search(t):
            out.college_type = "Private"

        # spaCy ruler entities
        for ent in doc.ents:
            if ent.label_ == "BRANCH" and out.branch is None:
                out.branch = canon_branch(ent.text)
            elif ent.label_ == "CATEGORY" and out.category is None:
                out.category = canon_category(ent.text)
            elif ent.label_ == "LOCATION" and out.district is None:
                out.district = canon_location(ent.text)

        # Heuristic location: "in Chennai", "at Coimbatore"
        loc_match = re.search(r"\b(in|at|near)\s+([A-Za-z][A-Za-z .'-]{2,40})\b", t, re.I)
        if loc_match and out.district is None:
            out.district = canon_location(loc_match.group(2))

        # College name heuristic: quoted or contains "College"
        college_match = re.search(r"\"([^\"]{3,80})\"", t)
        if college_match:
            out.college_name = college_match.group(1).strip()
        else:
            college_match = re.search(r"\b([A-Za-z][A-Za-z .'-]{2,80}\b(?:college|institute|university)\b[ A-Za-z.&'-]{0,40})", t, re.I)
            if college_match:
                out.college_name = college_match.group(1).strip()

        # Canonicalize remaining fields
        out.branch = canon_branch(out.branch)
        out.category = canon_category(out.category)
        out.college_type = canon_college_type(out.college_type)
        out.district = canon_location(out.district)

        return out

