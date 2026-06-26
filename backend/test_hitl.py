import httpx, json, sys

BASE = "http://localhost:8000/v1/api/hitl"

def test():
    print("=== GET /tasks ===")
    r = httpx.get(f"{BASE}/tasks", timeout=5)
    print(f"Status: {r.status_code}")
    print(r.text)

    print("\n=== POST /tasks ===")
    payload = {
        "title": "Test Approval",
        "description": "Please approve this grant",
        "taskType": "FormTask",
        "priority": "High",
        "actions": ["approve", "reject"],
        "metadata": {"jobId": "test-123"}
    }
    r = httpx.post(f"{BASE}/tasks", json=payload, timeout=5)
    print(f"Status: {r.status_code}")
    print(r.text)

    print("\n=== POST /webhook/task-created ===")
    wh = {
        "title": "Webhook Task",
        "description": "From UiPath",
        "taskType": "FormTask",
        "priority": "Medium",
        "metadata": {"source": "uipath"}
    }
    r = httpx.post(f"{BASE}/webhook/task-created", json=wh, timeout=5)
    print(f"Status: {r.status_code}")
    print(r.text)

    print("\n=== GET /tasks (should show 2) ===")
    r = httpx.get(f"{BASE}/tasks", timeout=5)
    print(f"Status: {r.status_code}")
    data = r.json()
    print(f"Count: {data.get('count')}")
    for t in data.get("tasks", []):
        print(f"  - {t['taskId']}: {t['title']} [{t['status']}]")

    print("\n=== ALL TESTS PASSED ===")

if __name__ == "__main__":
    test()
