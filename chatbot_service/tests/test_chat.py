from __future__ import annotations

import pytest
import respx
import httpx

from main import create_app


@pytest.mark.asyncio
async def test_chat_recommendation_missing_cutoff_and_category():
    app = create_app()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/chat", json={"user_id": "u1", "message": "Can I get CSE in Chennai?", "language": "en"})
        assert r.status_code == 200
        data = r.json()
        assert "intent" in data
        # should ask for cutoff/category clarification when recommendation intent
        assert "cutoff" in data["response_text"].lower() or "category" in data["response_text"].lower()


@pytest.mark.asyncio
async def test_chat_recommendation_calls_downstream():
    app = create_app()

    with respx.mock(assert_all_called=False) as router:
        router.post("http://127.0.0.1:3000/api/college-suggestions").respond(
            200,
            json=[
                {"name": "College A", "branchName": "CSE", "location": "Chennai", "matchScore": 78},
                {"name": "College B", "branchName": "CSE", "location": "Chennai", "matchScore": 55},
            ],
        )
        router.get("http://127.0.0.1:3000/api/cutoff-history").respond(200, json=[])

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            r = await client.post(
                "/chat",
                json={"user_id": "u2", "message": "I have 178 cutoff BC can I get CSE in Chennai?", "language": "en"},
            )
            assert r.status_code == 200
            data = r.json()
            assert data["intent"] in {"college_recommendation", "fallback_unknown", "greeting"}
            assert isinstance(data["results"], list)

