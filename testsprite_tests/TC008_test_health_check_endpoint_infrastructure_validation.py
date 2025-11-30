import requests

BASE_URL = "http://localhost:3000/marketing/campaigns/50"
HEALTH_CHECK_ENDPOINT = "http://localhost:3000/health"

HEADERS = {
    "Accept": "application/json",
    # Add authorization headers here if required, e.g.:
    # "Authorization": "Bearer <token>"
}

TIMEOUT = 30

def test_health_check_endpoint_infrastructure_validation():
    try:
        response = requests.get(HEALTH_CHECK_ENDPOINT, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Health check request failed with exception: {e}"

    assert response.status_code == 200, f"Expected HTTP 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    # Validate presence and success status of all required components
    expected_keys = {"database", "redis", "worker_queues", "ai_engine"}
    missing_keys = expected_keys - data.keys()
    assert not missing_keys, f"Missing keys in health check response: {missing_keys}"

    for key in expected_keys:
        status = data.get(key)
        assert status in ["ok", "healthy", "connected", True], (
            f"Health check for '{key}' indicates failure or unexpected status: {status}"
        )
    
    # Additional specific checks for session management, transaction handling, error handling...
    # Assuming health endpoint returns detailed status info for marketing campaigns backend
    # Validate no error keys detected
    error_keys = ["error", "failures", "exceptions", "errors"]
    errors_found = [k for k in error_keys if k in data and data[k]]
    assert not errors_found, f"Errors reported in health check response keys: {errors_found}"

test_health_check_endpoint_infrastructure_validation()
