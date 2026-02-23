# TNEA Insight – Intelligent NLP Chatbot Service (FastAPI)

This folder contains the **independent chatbot microservice** for TNEA Insight.

It provides:
- `POST /chat` for natural-language queries
- Intent classification (baseline TF‑IDF+LogReg + optional DistilBERT)
- Entity extraction (regex + spaCy EntityRuler + hooks for custom spaCy NER)
- Decision engine routing to **existing internal model APIs** (no ML logic re-implemented here)
- Session-based memory (cutoff/category/branch remembered per user session)

## Run locally (Windows / PowerShell)

1) Create & activate a venv

```bash
cd chatbot_service
py -3.10 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

2) (Optional) Train baseline intent model

```bash
python scripts/train_intent_baseline.py --data data/intent_samples.csv
```

3) Start the service

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health check: `GET http://127.0.0.1:8000/health`

## Environment variables

- `TNEA_API_BASE_URL` (default: `http://127.0.0.1:3000`)
- `TNEA_PREDICT_CUTOFF_PATH` (default: `/api/predict-cutoff`)
- `TNEA_RECOMMEND_COLLEGES_PATH` (default: `/api/college-suggestions`)
- `TNEA_COMPARE_COLLEGES_PATH` (default: `/api/compare-colleges`)
- `TNEA_SAFE_TARGET_DREAM_PATH` (default: `/api/safe-target-dream`)
- `TNEA_CUTOFF_HISTORY_PATH` (default: `/api/cutoff-history`)
- `INTENT_BACKEND` = `baseline` | `bert`
- `BASELINE_INTENT_MODEL_PATH` (default points to `intent_model/artifacts/baseline_intent.joblib`)
- `BERT_INTENT_MODEL_DIR` (default points to `intent_model/artifacts/distilbert_intent/`)
- `MEMORY_TTL_SECONDS` (default: `3600`)

## API

### `POST /chat`

Request:

```json
{
  "user_id": "12345",
  "session_id": "optional-session",
  "language": "en",
  "message": "I have 178 cutoff BC can I get CSE in Chennai?"
}
```

Response (render-ready JSON):

```json
{
  "intent": "college_recommendation",
  "confidence": 0.91,
  "entities": {
    "cutoff": 178.0,
    "category": "BC",
    "branch": "CSE",
    "location": "Chennai",
    "college_name": null,
    "college_type": null,
    "round_number": null,
    "gender_quota": null,
    "first_graduate_quota": null
  },
  "results": [
    {
      "college": "College A",
      "probability": 0.78,
      "probability_percent": 78,
      "classification": "Safe"
    }
  ],
  "response_text": "Based on your 178.0 cutoff (BC)..."
}
```

## Advanced model (DistilBERT) – optional

Install ML training deps:

```bash
pip install -r requirements-ml.txt
```

Train:

```bash
python scripts/train_intent_bert.py --data data/intent_samples.csv
```

Run with BERT:

```bash
setx INTENT_BACKEND bert
uvicorn main:app --reload
```

## spaCy NER training (optional)

This repo ships a hybrid extractor (regex + EntityRuler). If you want a trained NER:

```bash
python scripts/train_ner_spacy.py --data data/ner_train.jsonl
```

This produces a `DocBin` you can use in a full spaCy training pipeline.

## Deployment (Render/AWS)

### Render
- Service type: **Web Service**
- Runtime: **Python 3.10+**
- Build: `pip install -r chatbot_service/requirements.txt`
- Start: `uvicorn chatbot_service.main:app --host 0.0.0.0 --port $PORT`
- Add env vars: `TNEA_API_BASE_URL` pointing to your internal ML backend / Node gateway.

### AWS (ECS/Fargate)
- Package as a container (see `Dockerfile` suggestion below)
- Configure env vars and internal networking so the chatbot can reach your ML backend.

