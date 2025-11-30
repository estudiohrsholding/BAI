import requests
import uuid
import time

BASE_URL = "http://localhost:3000/marketing/campaigns/50"
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}
TIMEOUT = 30

def test_analytics_feature_usage_tracking():
    # Create a session for session management simulation
    session_id = str(uuid.uuid4())
    feature_name = "dashboard_view"
    usage_payload = {
        "session_id": session_id,
        "feature": feature_name,
        "timestamp": int(time.time()),
        "details": {
            "page": "dashboard",
            "metrics_viewed": ["revenue", "campaign_performance", "user_engagement"]
        }
    }

    # Step 1: Send usage tracking event to analytics endpoint (assumed /analytics/track)
    analytics_track_url = f"http://localhost:3000/marketing/campaigns/50/analytics/track"

    try:
        track_resp = requests.post(analytics_track_url, json=usage_payload, headers=HEADERS, timeout=TIMEOUT)
        assert track_resp.status_code == 200, f"Expected 200 OK from analytics track but got {track_resp.status_code}"
        if not track_resp.content:
            assert False, "Analytics track response empty"
        try:
            track_data = track_resp.json()
        except Exception as e:
            assert False, f"Failed to parse JSON from analytics track response: {e}"
        assert track_data.get("success") is True, "Analytics track response did not indicate success"
        tracked_event_id = track_data.get("event_id")
        assert tracked_event_id is not None, "Tracked event ID missing in analytics track response"

        # Step 2: Verify that the tracked data can be retrieved for reporting
        analytics_report_url = f"http://localhost:3000/marketing/campaigns/50/analytics/report"
        params = {"event_id": tracked_event_id}
        report_resp = requests.get(analytics_report_url, params=params, headers=HEADERS, timeout=TIMEOUT)
        assert report_resp.status_code == 200, f"Expected 200 OK from analytics report but got {report_resp.status_code}"
        if not report_resp.content:
            assert False, "Analytics report response empty"
        try:
            report_data = report_resp.json()
        except Exception as e:
            assert False, f"Failed to parse JSON from analytics report response: {e}"
        # Verify feature name if present
        assert "feature" in report_data and report_data["feature"] == feature_name, "Feature name mismatch in analytics report"
        # usage_count may or may not be present, assert if present
        if "usage_count" in report_data:
            assert isinstance(report_data["usage_count"], int) and report_data["usage_count"] >= 1, "Usage count invalid or missing in report"
        # event_ids may or may not be present, check if present
        if "event_ids" in report_data:
            assert tracked_event_id in report_data.get("event_ids", []), "Tracked event ID missing in report event_ids"

        # Step 3: Check credit management impact (simulate credit deduction on usage)
        credit_url = f"http://localhost:3000/marketing/campaigns/50/billing/credits"
        credit_resp_before = requests.get(credit_url, headers=HEADERS, timeout=TIMEOUT)
        assert credit_resp_before.status_code == 200, "Failed to get credit info before usage"
        try:
            credits_before = credit_resp_before.json().get("credits", None)
        except Exception as e:
            assert False, f"Failed to parse JSON from credit info before usage: {e}"
        assert credits_before is not None, "Credits info missing before usage"

        # Simulate that feature usage deducts credits asynchronously
        # Wait briefly and recheck credits
        time.sleep(2)
        credit_resp_after = requests.get(credit_url, headers=HEADERS, timeout=TIMEOUT)
        assert credit_resp_after.status_code == 200, "Failed to get credit info after usage"
        try:
            credits_after = credit_resp_after.json().get("credits", None)
        except Exception as e:
            assert False, f"Failed to parse JSON from credit info after usage: {e}"
        assert credits_after is not None, "Credits info missing after usage"
        assert credits_after <= credits_before, f"Expected credits after usage <= before usage but got {credits_after} > {credits_before}"

        # Step 4: Health check for session management & transaction handling via backend monitoring endpoint
        health_check_url = "http://localhost:3000/health/check"
        health_resp = requests.get(health_check_url, headers=HEADERS, timeout=TIMEOUT)
        assert health_resp.status_code == 200, "Health check endpoint failed"
        if not health_resp.content:
            assert False, "Health check response empty"
        try:
            health_data = health_resp.json()
        except Exception as e:
            assert False, f"Failed to parse JSON from health check response: {e}"
        # Validate session and transaction keys exist and are healthy
        assert health_data.get("database") == "healthy", "Database health check failed"
        assert health_data.get("redis") == "healthy", "Redis health check failed"
        assert health_data.get("transactions") == "healthy", "Transaction handling health check failed"
        assert health_data.get("session_management") == "healthy", "Session management health check failed"

    except requests.RequestException as e:
        assert False, f"Request exception occurred: {e}"


test_analytics_feature_usage_tracking()
