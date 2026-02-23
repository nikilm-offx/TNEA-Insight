from __future__ import annotations

"""
Minimal spaCy NER training script.

Input format: JSONL with lines like:
{"text":"...", "entities":[[start,end,"LABEL"], ...]}

Labels you may use: CATEGORY, BRANCH, LOCATION, COLLEGE, COLLEGE_TYPE, GENDER, ROUND
"""

import argparse
import json
from pathlib import Path

import spacy
from spacy.tokens import DocBin
from spacy.util import filter_spans


def load_jsonl(path: Path):
    examples = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            examples.append(json.loads(line))
    return examples


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert JSONL NER data into spaCy DocBin for training.")
    parser.add_argument("--data", type=str, default=str(Path(__file__).resolve().parents[1] / "data" / "ner_train.jsonl"))
    parser.add_argument("--out", type=str, default=str(Path(__file__).resolve().parents[1] / "ner_model" / "artifacts" / "train.spacy"))
    args = parser.parse_args()

    data_path = Path(args.data)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    nlp = spacy.blank("en")
    examples = load_jsonl(data_path)
    db = DocBin()

    for ex in examples:
        text = ex["text"]
        ents = ex.get("entities", [])
        doc = nlp.make_doc(text)
        spans = []
        for start, end, label in ents:
            span = doc.char_span(int(start), int(end), label=str(label), alignment_mode="contract")
            if span is not None:
                spans.append(span)
        doc.ents = filter_spans(spans)
        db.add(doc)

    db.to_disk(out_path)
    print(f"Wrote spaCy DocBin to: {out_path}")
    print("Next: `python -m spacy init config config.cfg --lang en --pipeline ner` and `python -m spacy train ...`")


if __name__ == "__main__":
    main()

