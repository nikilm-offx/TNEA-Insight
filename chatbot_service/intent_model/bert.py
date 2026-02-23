from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class IntentPrediction:
    intent: str
    confidence: float


class BertIntentClassifier:
    """
    Loads a fine-tuned DistilBERT (or any transformers sequence classifier) from a directory.
    This is optional at runtime; enable via INTENT_BACKEND=bert.
    """

    def __init__(self, model_dir: str):
        self.model_dir = model_dir
        self._tokenizer = None
        self._model = None

    def load(self) -> None:
        if self._model is not None:
            return
        if not os.path.exists(self.model_dir):
            raise FileNotFoundError(
                f"BERT intent model dir not found: {self.model_dir}. "
                "Train it with `python scripts/train_intent_bert.py`."
            )
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        self._tokenizer = AutoTokenizer.from_pretrained(self.model_dir)
        self._model = AutoModelForSequenceClassification.from_pretrained(self.model_dir)

    def predict(self, text: str) -> IntentPrediction:
        import torch

        self.load()
        inputs = self._tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = self._model(**inputs)
            logits = outputs.logits[0]
            probs = torch.softmax(logits, dim=-1)
            idx = int(torch.argmax(probs).item())
            conf = float(probs[idx].item())
        labels = self._model.config.id2label
        intent = labels.get(idx, "fallback_unknown")
        return IntentPrediction(intent=intent, confidence=conf)

