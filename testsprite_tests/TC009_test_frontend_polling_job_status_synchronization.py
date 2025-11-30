import requests
import time

BASE_URL = "http://localhost:3000/marketing/campaigns/50"
HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    # Placeholder for authorization token, replace "your_token_here" with actual
    "Authorization": "Bearer your_token_here"
}
TIMEOUT = 30

def test_frontend_polling_job_status_synchronization():
    # Step 1: Trigger a background job in campaign 50 (simulate starting content planner or async job)
    # Assume POST /jobs to create a background job for campaign 50 (not specified in PRD, assume endpoint)
    create_job_url = f"{BASE_URL}/jobs"
    job_payload = {
        "type": "content_generation",
        "campaign_id": 50,
        "parameters": {
            "posts": 4,
            "reels": 1
        }
    }

    try:
        # Create a background job
        response = requests.post(create_job_url, headers=HEADERS, json=job_payload, timeout=TIMEOUT)
        assert response.status_code == 201, f"Job creation failed: {response.status_code} {response.text}"
        job_data = response.json()
        job_id = job_data.get("id")
        assert job_id is not None, "Job ID missing in response"

        # Step 2: Poll job status to simulate frontend polling hook for real-time status update
        job_status_url = f"{BASE_URL}/jobs/{job_id}/status"

        max_poll_attempts = 12  # poll max 12 times (1 poll every 5 seconds = max 1 minute)
        poll_interval = 5

        last_status = None
        status_history = []

        for attempt in range(max_poll_attempts):
            poll_response = requests.get(job_status_url, headers=HEADERS, timeout=TIMEOUT)
            assert poll_response.status_code == 200, f"Failed to get job status: {poll_response.status_code}"
            status_data = poll_response.json()
            status = status_data.get("status")
            assert status in ("pending", "running", "completed", "failed"), f"Unexpected job status: {status}"

            # Collect status history for validations
            if status != last_status:
                status_history.append(status)
                last_status = status

            if status == "completed":
                # Verify job result presence and correctness (simulate response contains expected fields)
                result = status_data.get("result")
                assert result is not None, "Completed job missing result data"
                # Verify credit usage or transaction info if present
                credit_used = status_data.get("credits_used")
                assert credit_used is not None and isinstance(credit_used, int) and credit_used > 0, \
                    "Credit usage not properly reported in job status"
                break

            if status == "failed":
                error_info = status_data.get("error")
                assert error_info is not None, "Failed job missing error details"
                raise AssertionError(f"Background job failed with error: {error_info}")

            time.sleep(poll_interval)
        else:
            raise TimeoutError("Job did not complete within expected polling time")

        # Step 3: Validate that status progressed logically
        expected_progression = ["pending", "running", "completed"]
        idx = 0
        for stat in status_history:
            assert stat == expected_progression[idx] or stat == expected_progression[idx+1:idx+2][0], \
                f"Unexpected job status progression: {status_history}"
            if stat == expected_progression[idx+1:idx+2][0]:
                idx += 1

        # Step 4: Verify session and transaction consistency - simulate via an audit endpoint if exists
        audit_url = f"{BASE_URL}/jobs/{job_id}/audit"
        audit_response = requests.get(audit_url, headers=HEADERS, timeout=TIMEOUT)
        assert audit_response.status_code == 200, "Failed to retrieve audit data for job"
        audit_data = audit_response.json()

        # Check audit data contains expected keys for session, transactions, credits, n8n integration logs
        assert "db_sessions" in audit_data, "Audit missing database session info"
        assert "transactions" in audit_data, "Audit missing transaction info"
        assert "n8n_workflow" in audit_data, "Audit missing n8n integration details"
        assert "credits" in audit_data, "Audit missing credit management logs"

        # Spot check content of audit data (non-empty lists or dicts)
        assert isinstance(audit_data["db_sessions"], list) and len(audit_data["db_sessions"]) > 0, "Empty DB session logs"
        assert isinstance(audit_data["transactions"], list) and len(audit_data["transactions"]) > 0, "Empty transaction logs"
        assert isinstance(audit_data["n8n_workflow"], dict) and audit_data["n8n_workflow"].get("status") == "success", \
            "n8n workflow integration not successful"
        assert isinstance(audit_data["credits"], dict) and audit_data["credits"].get("deducted") is True, \
            "Credits not deducted properly in audit"

    finally:
        # Clean up - delete the created job to maintain test isolation if delete API exists
        if 'job_id' in locals():
            delete_url = f"{BASE_URL}/jobs/{job_id}"
            requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)

test_frontend_polling_job_status_synchronization()
