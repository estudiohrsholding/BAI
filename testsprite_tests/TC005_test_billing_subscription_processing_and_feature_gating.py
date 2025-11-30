import requests
import time

BASE_URL = "http://localhost:3000/marketing/campaigns/50"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer test_api_token"
}

def safe_json_decode(resp):
    try:
        return resp.json()
    except Exception as e:
        assert False, f"Response JSON decode failed: {resp.status_code} {resp.text}"

def create_subscription(payload):
    url = f"http://localhost:3000/billing/subscriptions"
    resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    return safe_json_decode(resp)

def delete_subscription(subscription_id):
    url = f"http://localhost:3000/billing/subscriptions/{subscription_id}"
    resp = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()

def get_campaign_status():
    return requests.get(BASE_URL + "/status", headers=HEADERS, timeout=TIMEOUT)

def create_payment_intent(payload):
    url = "http://localhost:3000/billing/payments"
    resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    return safe_json_decode(resp)

def get_feature_gating(client_id):
    url = f"http://localhost:3000/billing/feature-gating/{client_id}"
    resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    return safe_json_decode(resp)

def test_billing_subscription_processing_and_feature_gating():
    subscription_payload = {
        "client_id": "test_client_123",
        "plan": "Motor",
        "setup_fee": 1000,
        "booster_credits": 3,
        "payment_method": "stripe_test_pm_visa",
        "billing_cycle": "monthly"
    }

    payment_payload = {
        "client_id": "test_client_123",
        "amount": 2500,
        "currency": "usd",
        "payment_method": "stripe_test_pm_visa",
        "description": "Setup fee, subscription and booster credits payment"
    }

    subscription = None
    try:
        subscription = create_subscription(subscription_payload)
        subscription_id = subscription.get("id")
        assert subscription_id, "Subscription creation failed - no ID returned"

        payment_response = create_payment_intent(payment_payload)
        payment_id = payment_response.get("id")
        assert payment_id, "Payment intent creation failed - no ID returned"
        assert payment_response.get("status") in ["succeeded", "processing", "pending"], f"Unexpected payment status: {payment_response.get('status')}"

        time.sleep(5)

        status_resp = get_campaign_status()
        assert status_resp.status_code == 200
        status_json = safe_json_decode(status_resp)

        assert "billing" in status_json and status_json["billing"].get("last_payment_status") == "succeeded"
        assert "credits" in status_json and status_json["credits"].get("booster_credits_remaining") == subscription_payload["booster_credits"]

        feature_gating = get_feature_gating(subscription_payload["client_id"])
        assert feature_gating.get("subscription_tier") == subscription_payload["plan"]
        assert feature_gating.get("booster_credits") == subscription_payload["booster_credits"]
        assert feature_gating.get("features_enabled") is not None
        assert "PartnerFeatureX" not in feature_gating.get("features_enabled", [])

        assert status_json.get("db_session") == "active"
        assert status_json.get("transactions_processed") > 0
        assert status_json.get("n8n_workflows_status") == "completed"

    finally:
        if subscription and subscription.get("id"):
            try:
                delete_subscription(subscription_id)
            except Exception:
                pass

test_billing_subscription_processing_and_feature_gating()
