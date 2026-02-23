from __future__ import annotations

import argparse
import csv
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


def main() -> None:
    parser = argparse.ArgumentParser(description="Train baseline TF-IDF + LogisticRegression intent classifier.")
    parser.add_argument("--data", type=str, default=str(Path(__file__).resolve().parents[1] / "data" / "intent_samples.csv"))
    parser.add_argument(
        "--out",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "intent_model" / "artifacts" / "baseline_intent.joblib"),
    )
    args = parser.parse_args()

    X: list[str] = []
    y: list[str] = []
    with open(args.data, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None or "text" not in reader.fieldnames or "intent" not in reader.fieldnames:
            raise ValueError("CSV must contain headers: text,intent")
        for row in reader:
            X.append(str(row["text"]))
            y.append(str(row["intent"]))

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    except ValueError:
        # If the dataset is too small for stratification, fall back to a simple split.
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = Pipeline(
        steps=[
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_df=0.95)),
            ("clf", LogisticRegression(max_iter=2000, n_jobs=None, class_weight="balanced")),
        ]
    )
    pipeline.fit(X_train, y_train)

    if len(X_test) > 0:
        y_pred = pipeline.predict(X_test)
        print(classification_report(y_test, y_pred))

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, out_path)
    print(f"Saved baseline intent model to: {out_path}")


if __name__ == "__main__":
    main()

