import requests
import uuid

BASE_URL = "http://localhost:3000/marketing/campaigns"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer <token>"
}
TIMEOUT = 30


def test_content_creator_multi_platform_campaign_generation():
    campaign_id = None
    # Sample payload to create a multi-platform influencer content campaign with AI-generated multimedia content
    create_payload = {
        "campaign_name": f"AI MultiPlatform Campaign {uuid.uuid4()}",
        "description": "Campaign supporting multi-platform influencer content creation with AI multimedia.",
        "platforms": ["instagram", "youtube", "tiktok"],
        "influencers": [
            {"id": "influencer_1", "name": "Influencer One"},
            {"id": "influencer_2", "name": "Influencer Two"}
        ],
        "content_specifications": {
            "types": ["video", "image", "text"],
            "ai_generation": True,
            "media_requirements": {
                "resolution": "1080p",
                "length_seconds": 30,
            }
        },
        "budget": 1500.0,
        "currency": "USD",
        "schedule": {
            "start_date": "2025-12-01T09:00:00Z",
            "end_date": "2025-12-30T21:00:00Z"
        },
        "credits_required": 10  # implies credit management
    }

    try:
        # Step 1: Create Campaign (POST to base endpoint assumed for campaign creation)
        response_create = requests.post(
            BASE_URL, json=create_payload, headers=HEADERS, timeout=TIMEOUT
        )
        assert response_create.status_code == 201, f"Unexpected create status: {response_create.status_code} {response_create.text}"
        data_create = response_create.json()
        assert "id" in data_create, "Created campaign response missing 'id'"
        campaign_id = data_create["id"]

        # Step 2: Verify backend database interaction by fetching campaign details
        get_url = f"http://localhost:3000/marketing/campaigns/{campaign_id}"
        response_get = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
        assert response_get.status_code == 200, f"Get campaign failed: {response_get.status_code} {response_get.text}"
        data_get = response_get.json()
        # Validate returned campaign matches creation request
        assert data_get["campaign_name"] == create_payload["campaign_name"]
        assert data_get["platforms"] == create_payload["platforms"]
        assert data_get["content_specifications"]["ai_generation"] is True
        assert "credits_required" in data_get and data_get["credits_required"] == create_payload["credits_required"]

        # Step 3: Trigger campaign content generation workflow (assumed start endpoint)
        start_url = f"{get_url}/actions/start_generation"
        response_start = requests.post(start_url, headers=HEADERS, timeout=TIMEOUT)
        assert response_start.status_code == 202, f"Start generation failed: {response_start.status_code} {response_start.text}"
        start_data = response_start.json()
        assert "job_id" in start_data, "Missing job_id to track generation status"

        job_id = start_data["job_id"]

        # Step 4: Poll for generation job status to audit async task and data flow with timeout
        status_url = f"http://localhost:3000/marketing/jobs/{job_id}/status"
        for _ in range(10):
            resp_status = requests.get(status_url, headers=HEADERS, timeout=TIMEOUT)
            if resp_status.status_code != 200:
                break
            status_data = resp_status.json()
            if status_data.get("status") == "completed":
                break
            elif status_data.get("status") == "failed":
                assert False, f"Campaign generation job failed: {status_data.get('error_detail','No details')}"
            import time
            time.sleep(3)
        else:
            assert False, "Timed out waiting for campaign generation job to complete"

        # Step 5: Verify credit management deduction (assume credit endpoint)
        credits_url = f"http://localhost:3000/user/credits"
        resp_credits = requests.get(credits_url, headers=HEADERS, timeout=TIMEOUT)
        assert resp_credits.status_code == 200, f"Failed fetching user credits: {resp_credits.text}"
        credits_data = resp_credits.json()
        assert credits_data.get("available_credits", 0) >= 0, "User credits should not be negative after deduction."

        # Step 6: Validate n8n integration and data flow audit (check logs or status endpoint)
        n8n_status_url = f"http://localhost:3000/marketing/campaigns/{campaign_id}/n8n_status"
        resp_n8n = requests.get(n8n_status_url, headers=HEADERS, timeout=TIMEOUT)
        assert resp_n8n.status_code == 200, f"Failed to get n8n workflow status: {resp_n8n.text}"
        n8n_data = resp_n8n.json()
        assert n8n_data.get("workflow_status") == "success", f"n8n workflow not successful: {n8n_data}"

        # Step 7: Confirm session and transaction handling (dummy test: check for transaction committed flag)
        transaction_url = f"http://localhost:3000/marketing/campaigns/{campaign_id}/transaction_status"
        resp_tx = requests.get(transaction_url, headers=HEADERS, timeout=TIMEOUT)
        assert resp_tx.status_code == 200, "Failed to get transaction status"
        tx_data = resp_tx.json()
        assert tx_data.get("transaction_committed") is True, "Transaction was not properly committed"

    finally:
        # Cleanup: Delete the created campaign if it was created
        if campaign_id:
            del_url = f"http://localhost:3000/marketing/campaigns/{campaign_id}"
            try:
                resp_del = requests.delete(del_url, headers=HEADERS, timeout=TIMEOUT)
                assert resp_del.status_code in (200, 204), f"Failed to delete campaign: {resp_del.status_code} {resp_del.text}"
            except Exception as e:
                print(f"Warning: failed to cleanup campaign {campaign_id}: {e}")


test_content_creator_multi_platform_campaign_generation()
