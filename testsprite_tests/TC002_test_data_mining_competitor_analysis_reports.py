import requests
import time

BASE_URL = "http://localhost:3000/data-mining"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    # Assuming an auth token is required; replace 'your_token_here' with a valid token if needed
    "Authorization": "Bearer your_token_here"
}
TIMEOUT = 30

def test_data_mining_competitor_analysis_reports():
    # 1. Initiate a data mining competitor analysis request simulating client input
    analysis_payload = {
        "query": "competitor market share and trend analysis",
        "parameters": {
            "use_brave_search": True,
            "use_gemini_ai": True,
            "time_frame": "last_6_months"
        }
    }

    # Start session and transaction simulation by creating a new analysis job
    try:
        # POST request to create a new data mining job
        response = requests.post(
            f"{BASE_URL}/analysis",
            json=analysis_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code in (200, 202), f"Expected 202 Accepted or 200 OK, got {response.status_code}"
        data = response.json()
        assert "job_id" in data and data["job_id"], "Response missing job_id"
        job_id = data["job_id"]

        # Poll job status until completion or timeout to handle async processing and transaction finality
        max_poll_attempts = 20
        poll_interval = 3
        job_status = None
        for _ in range(max_poll_attempts):
            status_resp = requests.get(
                f"{BASE_URL}/analysis/{job_id}/status",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert status_resp.status_code == 200, f"Status check failed with {status_resp.status_code}"
            status_data = status_resp.json()
            job_status = status_data.get("status")
            if job_status == "completed":
                break
            elif job_status == "failed":
                raise AssertionError("Data mining job failed during processing")
            time.sleep(poll_interval)
        else:
            raise AssertionError("Data mining job did not complete in expected time")

        # Fetch detailed report after job completion
        report_resp = requests.get(
            f"{BASE_URL}/analysis/{job_id}/report",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert report_resp.status_code == 200, f"Report fetch failed with {report_resp.status_code}"
        report = report_resp.json()

        # Validate report structure and content coherence
        assert "competitor_analysis" in report, "Report missing competitor_analysis section"
        assert "market_trends" in report, "Report missing market_trends section"
        assert isinstance(report["competitor_analysis"], dict), "competitor_analysis should be a dict"
        assert isinstance(report["market_trends"], dict), "market_trends should be a dict"
        assert len(report["competitor_analysis"]) > 0, "competitor_analysis is empty"
        assert len(report["market_trends"]) > 0, "market_trends is empty"

        # Verify session management: session token or ID is consistent if returned (simulate)
        if "session_id" in status_data:
            session_id_first = status_data["session_id"]
            session_resp = requests.get(
                f"{BASE_URL}/session/{session_id_first}/info",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert session_resp.status_code == 200, "Failed to retrieve session info"
            session_info = session_resp.json()
            assert session_info.get("session_id") == session_id_first, "Session ID mismatch"

    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")
    finally:
        # Attempt to delete the analysis job to maintain clean backend state and proper transaction closure
        try:
            del_resp = requests.delete(
                f"{BASE_URL}/analysis/{job_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            # Allow 204 No Content or 200 OK as success for deletion
            assert del_resp.status_code in (200, 204), f"Failed to delete analysis job, status {del_resp.status_code}"
        except Exception:
            pass  # Not failing test on cleanup failure

test_data_mining_competitor_analysis_reports()