from __future__ import annotations

import os
from dataclasses import dataclass

import joblib


@dataclass(frozen=True)
class IntentPrediction:
    intent: str
    confidence: float


class BaselineIntentClassifier:
    """
    Loads a scikit-learn Pipeline saved via joblib.
    Expected pipeline: TF-IDF vectorizer + LogisticRegression.
    """

    def __init__(self, model_path: str):
        self.model_path = model_path
        self._pipeline = None

    def load(self) -> None:
        if self._pipeline is not None:
            return
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Baseline intent model not found at: {self.model_path}. "
                "Train it with `python scripts/train_intent_baseline.py`."
            )
        self._pipeline = joblib.load(self.model_path)

    def predict(self, text: str) -> IntentPrediction:
        self.load()
        proba = self._pipeline.predict_proba([text])[0]
        classes = list(self._pipeline.classes_)
        best_i = int(proba.argmax())
        return IntentPrediction(intent=classes[best_i], confidence=float(proba[best_i]))

