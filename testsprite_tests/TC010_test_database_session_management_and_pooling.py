import requests
import time

BASE_ENDPOINT = "http://localhost:3000/marketing/campaigns/50"
HEADERS = {
    "Accept": "application/json",
    # Add Authentication headers if required e.g. "Authorization": "Bearer TOKEN"
}
TIMEOUT = 30


def test_database_session_management_and_pooling():
    """
    Test database session management focusing on session pooling, transaction handling,
    error handling, and data flow in marketing campaigns endpoint.
    """

    # Step 1: Verify initial GET request to retrieve campaign details works and is efficient
    start_time = time.time()
    try:
        response = requests.get(BASE_ENDPOINT, headers=HEADERS, timeout=TIMEOUT)
        duration = time.time() - start_time
    except requests.RequestException as e:
        assert False, f"Initial GET request to campaign endpoint failed: {e}"

    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"

    # Only parse JSON if response has content
    if response.content:
        try:
            campaign_data = response.json()
        except ValueError:
            assert False, "Campaign data response is not valid JSON"
    else:
        assert False, "Campaign data response is empty"

    # Basic schema checks (minimal since schema not detailed): Must have id and name or alike
    assert isinstance(campaign_data, dict), "Campaign data response not a JSON object"
    assert 'id' in campaign_data and campaign_data['id'] == 50, "Campaign ID mismatch or missing"
    assert 'name' in campaign_data or 'title' in campaign_data or 'campaignName' in campaign_data, "Campaign name/title missing"

    # Assert reasonable response time demonstrating no session pool exhaustion
    assert duration < 5, f"Initial GET took too long ({duration}s), possible DB session pool issue"

    # Step 2: Simulate multiple rapid requests to test session pooling under load
    # We will issue 10 parallel or serial GET requests and check response consistency and no errors
    errors = []
    durations = []
    for i in range(10):
        try:
            start = time.time()
            r = requests.get(BASE_ENDPOINT, headers=HEADERS, timeout=TIMEOUT)
            duration = time.time() - start
            durations.append(duration)
            if r.status_code != 200:
                errors.append(f"Request {i} status code {r.status_code}")
            else:
                # Validate response structure consistency
                if r.content:
                    try:
                        resp_data = r.json()
                    except ValueError:
                        errors.append(f"Request {i} returned invalid JSON")
                        continue
                    if not isinstance(resp_data, dict) or 'id' not in resp_data or resp_data['id'] != 50:
                        errors.append(f"Request {i} returned invalid campaign data")
                else:
                    errors.append(f"Request {i} returned empty content")
        except requests.RequestException as e:
            errors.append(f"Request {i} failed with exception: {e}")

    assert not errors, f"Errors during multiple campaign GET requests: {errors}"
    avg_duration = sum(durations) / len(durations)
    assert avg_duration < 3, f"Average request duration too high ({avg_duration}s), session pooling may be inefficient"

    # Step 3: Update campaign with PUT to test transaction handling and session management
    update_payload = {
        "name": campaign_data.get("name", "Updated Campaign Name"),
        "description": "Testing database session management update.",
        # Any other editable fields can be added, assuming minimal schema
    }
    try:
        put_response = requests.put(BASE_ENDPOINT, json=update_payload, headers={**HEADERS, "Content-Type": "application/json"}, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"PUT request to update campaign failed: {e}"

    assert put_response.status_code in (200, 204), f"Expected 200 or 204 on update, got {put_response.status_code}"

    # Step 4: Confirm campaign data was updated correctly
    try:
        confirm_response = requests.get(BASE_ENDPOINT, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"GET request after update failed: {e}"

    assert confirm_response.status_code == 200, f"Expected 200 on get after update, got {confirm_response.status_code}"

    if confirm_response.content:
        try:
            confirm_data = confirm_response.json()
        except ValueError:
            assert False, "Confirm GET response is not valid JSON"
    else:
        assert False, "Confirm GET response empty"

    assert confirm_data.get("name") == update_payload["name"], "Campaign name was not updated correctly"

    # Step 5: Test error handling - send invalid update (e.g. empty payload)
    invalid_payload = {}
    try:
        invalid_resp = requests.put(BASE_ENDPOINT, json=invalid_payload, headers={**HEADERS, "Content-Type": "application/json"}, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"PUT request with invalid payload failed due to network: {e}"

    assert invalid_resp.status_code >= 400, f"Expected 4xx or 5xx status on invalid update, got {invalid_resp.status_code}"


test_database_session_management_and_pooling()
