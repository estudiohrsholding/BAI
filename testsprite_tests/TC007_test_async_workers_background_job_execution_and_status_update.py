import requests
import time

BASE_URL = "http://localhost:3000/marketing/campaigns/50"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

def test_async_workers_background_job_execution_and_status_update():
    job_create_url = f"{BASE_URL}/jobs"
    job_status_url_template = f"{BASE_URL}/jobs/{{job_id}}/status"
    audit_log_url = f"{BASE_URL}/audit-logs"
    credits_url = f"{BASE_URL}/credits"
    session_check_url = f"{BASE_URL}/session"
    transaction_check_url = f"{BASE_URL}/transactions"
    n8n_integration_url = f"{BASE_URL}/n8n/integration/status"

    job_id = None

    try:
        # Start a background job asynchronously
        job_payload = {
            "type": "content_generation",
            "parameters": {
                "client_id": "50",
                "campaign_type": "monthly_post_and_reel"
            }
        }
        response = requests.post(job_create_url, json=job_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code in (200, 202), f"Expected 202 or 200 Accepted, got {response.status_code}"
        if response.content:
            resp_json = response.json()
        else:
            resp_json = {}
        job_id = resp_json.get("job_id")
        assert job_id is not None, "No job_id returned from job creation"

        # Check session is active and valid for campaign operations
        session_resp = requests.get(session_check_url, headers=HEADERS, timeout=TIMEOUT)
        assert session_resp.status_code == 200, "Session check failed"
        if session_resp.content:
            session_data = session_resp.json()
        else:
            session_data = {}
        assert session_data.get("active") is True, "Session is not active"

        # Poll job status until finished or error with timeout 2 minutes
        poll_timeout = 120
        poll_interval = 5
        elapsed = 0
        job_status = None
        while elapsed < poll_timeout:
            status_resp = requests.get(job_status_url_template.format(job_id=job_id), headers=HEADERS, timeout=TIMEOUT)
            assert status_resp.status_code == 200, f"Failed to get job status with {status_resp.status_code}"
            if status_resp.content:
                status_json = status_resp.json()
            else:
                status_json = {}
            job_status = status_json.get("status")
            assert job_status is not None, "No status field in job status response"

            if job_status in ("completed", "failed"):
                break
            time.sleep(poll_interval)
            elapsed += poll_interval

        assert job_status == "completed", f"Job did not complete successfully, final status: {job_status}"

        # Validate audit logs recorded the job execution
        audit_resp = requests.get(audit_log_url, params={"job_id": job_id}, headers=HEADERS, timeout=TIMEOUT)
        assert audit_resp.status_code == 200, "Failed to fetch audit logs"
        if audit_resp.content:
            audit_logs = audit_resp.json()
        else:
            audit_logs = []
        assert any(log.get("job_id") == job_id and log.get("action") == "EXECUTED" for log in audit_logs), "No EXECUTED audit log entry for job"

        # Validate n8n integration status for job executed
        n8n_resp = requests.get(n8n_integration_url, headers=HEADERS, timeout=TIMEOUT)
        assert n8n_resp.status_code == 200, "n8n integration status check failed"
        if n8n_resp.content:
            n8n_data = n8n_resp.json()
        else:
            n8n_data = {}
        assert n8n_data.get("last_job_id") == job_id, "n8n last job ID does not match executed job"
        assert n8n_data.get("status") == "connected", "n8n not connected properly"

        # Validate credit deduction happened for the job
        credits_resp = requests.get(credits_url, headers=HEADERS, timeout=TIMEOUT)
        assert credits_resp.status_code == 200, "Failed to get credits info"
        if credits_resp.content:
            credits_data = credits_resp.json()
        else:
            credits_data = {}
        assert credits_data.get("remaining_credits") is not None, "Credits data missing"
        assert credits_data.get("last_deduction_job_id") == job_id, "Credits last deduction job ID mismatch"

        # Check no uncommitted transactions remain open after job completion
        tx_resp = requests.get(transaction_check_url, headers=HEADERS, timeout=TIMEOUT)
        assert tx_resp.status_code == 200, "Transaction check failed"
        if tx_resp.content:
            tx_data = tx_resp.json()
        else:
            tx_data = {}
        assert tx_data.get("open_transactions") == 0, "There are open transactions after job completion"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"

test_async_workers_background_job_execution_and_status_update()
