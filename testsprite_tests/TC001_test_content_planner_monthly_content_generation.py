import requests
import time

BASE_URL = "http://localhost:3000/marketing/campaigns/50"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
    # Authorization header placeholder; add token if authentication is required
    # "Authorization": "Bearer <token>"
}

def test_content_planner_monthly_content_generation():
    """
    Verify that the Content Planner module generates exactly 4 posts and 1 reel monthly per client
    with correct scheduling and media generation using n8n workflows.
    Audit backend DB interactions, n8n integration, credit management, session management,
    transaction handling, and error handling in marketing campaigns endpoints.
    """
    session = requests.Session()
    session.headers.update(HEADERS)

    # 1. Start content generation workflow via POST or PATCH if available, else simulate generation trigger.
    # Since no exact endpoint for generation trigger is given, assume a POST to /generate or similar.
    generate_url = f"{BASE_URL}/content-planner/generate"
    try:
        generate_resp = session.post(generate_url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Exception when triggering content generation: {e}"
    else:
        assert generate_resp.status_code == 202 or generate_resp.status_code == 200, \
            f"Unexpected status code from generation trigger: {generate_resp.status_code}"
    
    # 2. Poll status endpoint to wait for generation completion.
    status_url = f"{BASE_URL}/content-planner/status"
    max_wait_seconds = 120
    interval = 5
    elapsed = 0
    generation_complete = False
    generation_response_data = None

    while elapsed < max_wait_seconds:
        try:
            status_resp = session.get(status_url, timeout=TIMEOUT)
            if status_resp.status_code != 200:
                # Possible transient error, wait and retry
                time.sleep(interval)
                elapsed += interval
                continue
            status_data = status_resp.json()
        except requests.RequestException as e:
            time.sleep(interval)
            elapsed += interval
            continue

        # Expecting status_data to include job status and possibly counts of generated content
        # e.g. {"status": "completed", "posts_generated": 4, "reels_generated": 1, "errors": []}
        if status_data.get("status") == "completed":
            generation_complete = True
            generation_response_data = status_data
            break
        elif status_data.get("status") == "failed":
            assert False, f"Content generation failed with errors: {status_data.get('errors')}"
        else:
            # Still processing
            time.sleep(interval)
            elapsed += interval

    assert generation_complete, f"Content generation did not complete within {max_wait_seconds}s"

    # 3. Validate generated content counts
    posts_count = generation_response_data.get("posts_generated")
    reels_count = generation_response_data.get("reels_generated")
    errors = generation_response_data.get("errors", [])

    assert posts_count == 4, f"Expected 4 posts generated but got {posts_count}"
    assert reels_count == 1, f"Expected 1 reel generated but got {reels_count}"
    assert not errors, f"Errors occurred during content generation: {errors}"

    # 4. Validate scheduling correctness
    # Assuming scheduling info available in response or via another endpoint
    schedule_url = f"{BASE_URL}/content-planner/schedule"
    try:
        schedule_resp = session.get(schedule_url, timeout=TIMEOUT)
        assert schedule_resp.status_code == 200, f"Failed to fetch schedule: {schedule_resp.status_code}"
        schedule_data = schedule_resp.json()
    except requests.RequestException as e:
        assert False, f"Exception when fetching schedule data: {e}"

    # Basic validation: 5 items scheduled, spread across different dates within the current month
    scheduled_items = schedule_data.get("scheduled_items", [])
    assert len(scheduled_items) == 5, f"Expected 5 scheduled items but got {len(scheduled_items)}"

    from datetime import datetime
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year

    def is_date_in_current_month(date_string):
        try:
            dt = datetime.fromisoformat(date_string)
            return dt.year == current_year and dt.month == current_month
        except Exception:
            return False

    # Check dates valid and types correct
    posts_scheduled = 0
    reels_scheduled = 0
    media_generated_ok = True

    for item in scheduled_items:
        content_type = item.get("type")  # Expect "post" or "reel"
        scheduled_date = item.get("scheduled_date")
        media_url = item.get("media_url")  # Should be a URL or non-empty string if media generated

        assert content_type in ("post", "reel"), f"Invalid content type: {content_type}"
        assert scheduled_date and is_date_in_current_month(scheduled_date), \
            f"Scheduled date {scheduled_date} not in current month"

        # Check media_url presence and non-empty (indicating media generated)
        if not media_url or not isinstance(media_url, str) or media_url.strip() == "":
            media_generated_ok = False

        if content_type == "post":
            posts_scheduled += 1
        elif content_type == "reel":
            reels_scheduled += 1

    assert posts_scheduled == 4, f"Expected 4 posts scheduled but got {posts_scheduled}"
    assert reels_scheduled == 1, f"Expected 1 reel scheduled but got {reels_scheduled}"
    assert media_generated_ok, "One or more scheduled items missing generated media"

    # 5. Audit credit management for this generation
    credits_url = f"{BASE_URL}/credits"
    try:
        credits_resp = session.get(credits_url, timeout=TIMEOUT)
        assert credits_resp.status_code == 200, f"Failed to fetch credits info: {credits_resp.status_code}"
        credits_data = credits_resp.json()
    except requests.RequestException as e:
        assert False, f"Exception when fetching credits: {e}"

    # Expect credits used reflect consumed credits for 4 posts + 1 reel generation
    credits_before = credits_data.get("credits_before_generation")
    credits_after = credits_data.get("credits_after_generation")

    assert credits_before is not None and credits_after is not None, "Credits info incomplete"

    # credits should decrease by at least 5 (assuming 1 credit per content)
    used_credits = credits_before - credits_after
    assert used_credits >= 5, f"Used credits {used_credits} insufficient for 4 posts + 1 reel generation"

    # 6. Validate no unexpected session or transaction errors in campaign endpoint logs if exposed
    # This requires either a logs endpoint or error field in status - assumed as part of status response
    backend_errors = generation_response_data.get("backend_errors", [])
    assert not backend_errors, f"Backend session/transaction errors during generation: {backend_errors}"

test_content_planner_monthly_content_generation()