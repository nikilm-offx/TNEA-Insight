from __future__ import annotations

import argparse
import csv
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune DistilBERT for intent classification.")
    parser.add_argument("--data", type=str, default=str(Path(__file__).resolve().parents[1] / "data" / "intent_samples.csv"))
    parser.add_argument(
        "--out_dir",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "intent_model" / "artifacts" / "distilbert_intent"),
    )
    parser.add_argument("--model_name", type=str, default="distilbert-base-uncased")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=16)
    args = parser.parse_args()

    texts: list[str] = []
    intents_raw: list[str] = []
    with open(args.data, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None or "text" not in reader.fieldnames or "intent" not in reader.fieldnames:
            raise ValueError("CSV must contain headers: text,intent")
        for row in reader:
            texts.append(str(row["text"]))
            intents_raw.append(str(row["intent"]))

    intents = sorted(set(intents_raw))
    label2id = {label: i for i, label in enumerate(intents)}
    id2label = {i: label for label, i in label2id.items()}
    labels = [label2id[i] for i in intents_raw]

    from datasets import Dataset
    from transformers import (
        AutoTokenizer,
        AutoModelForSequenceClassification,
        TrainingArguments,
        Trainer,
        DataCollatorWithPadding,
    )
    from sklearn.model_selection import train_test_split
    import numpy as np
    import evaluate

    X_train, X_eval, y_train, y_eval = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )
    train_ds = Dataset.from_dict({"text": X_train, "label": y_train})
    eval_ds = Dataset.from_dict({"text": X_eval, "label": y_eval})

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)

    def tokenize(batch):
        return tokenizer(batch["text"], truncation=True)

    train_ds = train_ds.map(tokenize, batched=True)
    eval_ds = eval_ds.map(tokenize, batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name, num_labels=len(intents), label2id=label2id, id2label=id2label
    )

    accuracy = evaluate.load("accuracy")

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        preds = np.argmax(logits, axis=-1)
        return accuracy.compute(predictions=preds, references=labels)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=str(out_dir),
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        logging_steps=20,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
        compute_metrics=compute_metrics,
    )
    trainer.train()

    model.save_pretrained(out_dir)
    tokenizer.save_pretrained(out_dir)
    print(f"Saved BERT intent model to: {out_dir}")


if __name__ == "__main__":
    try:
        import transformers as _  # noqa: F401
        import datasets as _  # noqa: F401
        import torch as _  # noqa: F401
        import evaluate as _  # noqa: F401
    except Exception:
        raise SystemExit("Please install requirements-ml.txt to run this script (transformers/datasets/torch/evaluate).")
    main()

