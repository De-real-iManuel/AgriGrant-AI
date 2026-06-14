import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "ok"
    assert "uipath_connected" in json_data
    assert json_data["version"] == "1.0.0"

def test_pipeline_validation_error():
    # Empty farmerName should fail validation
    payload = {
        "farmerName": "",
        "stateOfResidence": "Lagos",
        "farmType": "Crop Farming",
        "fundingPurpose": "Buying fertilizers and crop seeds."
    }
    response = client.post("/api/pipeline/submit", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"]["status"] == "VALIDATION_ERROR"

def test_pipeline_loan_disqualified():
    payload = {
        "farmerName": "Musa Okafor",
        "stateOfResidence": "Kano",
        "farmType": "Livestock",
        "fundingPurpose": "Buying animal feed and vaccines.",
        "hasExistingLoanDefault": True
    }
    response = client.post("/api/pipeline/submit", json=payload)
    assert response.status_code == 202
    json_data = response.json()
    assert json_data["status"] == "DISQUALIFIED"
    assert "loan default" in json_data["message"]

def test_pipeline_submit_and_status():
    payload = {
        "farmerName": "Musa Okafor",
        "stateOfResidence": "Kano",
        "farmType": "Livestock",
        "fundingPurpose": "Buying animal feed and vaccines.",
        "hasExistingLoanDefault": False
    }
    response = client.post("/api/pipeline/submit", json=payload)
    assert response.status_code == 202
    json_data = response.json()
    assert json_data["status"] == "PROCESSING"
    job_id = json_data["jobId"]
    
    # Query status
    status_response = client.get(f"/api/pipeline/status/{job_id}")
    assert status_response.status_code == 200
    assert status_response.json()["jobId"] == job_id
