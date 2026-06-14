import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_start_and_message():
    # Start chat
    start_payload = {
        "farmerName": "Aliyu",
        "farmerProfile": None
    }
    response = client.post("/api/chat/start", json=start_payload)
    assert response.status_code == 200
    json_data = response.json()
    assert "sessionId" in json_data
    assert "token" in json_data
    assert "greeting" in json_data
    
    session_id = json_data["sessionId"]
    token = json_data["token"]
    
    # Send message using the session token
    headers = {"Authorization": f"Bearer {token}"}
    msg_payload = {
        "sessionId": session_id,
        "message": "Hello, how can I find poultry grants?"
    }
    msg_response = client.post("/api/chat/message", json=msg_payload, headers=headers)
    assert msg_response.status_code == 200
    msg_data = msg_response.json()
    assert msg_data["sessionId"] == session_id
    assert msg_data["message"]["role"] == "assistant"
    assert "poultry" in msg_data["message"]["content"].lower() or "cbn" in msg_data["message"]["content"].lower()

def test_chat_history():
    # Start chat
    start_payload = {
        "farmerName": "Aliyu",
        "farmerProfile": None
    }
    response = client.post("/api/chat/start", json=start_payload)
    session_id = response.json()["sessionId"]
    token = response.json()["token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    history_response = client.get(f"/api/chat/history/{session_id}", headers=headers)
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert history_data["sessionId"] == session_id
    assert len(history_data["messages"]) > 0
