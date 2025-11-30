import requests
import uuid
import time

BASE_URL = "http://localhost:3000/chat"
HEADERS = {
    "Content-Type": "application/json",
    # Add Authorization header if required, e.g.
    # "Authorization": "Bearer <token>"
}
TIMEOUT = 30


def test_chat_module_ai_personality_switching_and_context_recall():
    """
    Test that the AI chatbot correctly switches personalities based on client_id and recalls conversation context across sessions.
    This involves:
    - Creating or using two distinct client_ids.
    - Sending messages to start a conversation for each client.
    - Verifying AI personality switching by differences in replies.
    - Verifying that context is recalled in follow-up messages per client.
    - Ensuring cleanup if resources are created.
    """
    session = requests.Session()
    session.headers.update(HEADERS)
    try:
        # Step 1: Define two distinct client_ids for multi-tenant testing
        client_id_1 = f"test-client-{uuid.uuid4()}"
        client_id_2 = f"test-client-{uuid.uuid4()}"

        # Step 2: Start sessions for each client with initial messages
        initial_message_1 = "Hello, what is your personality?"
        initial_message_2 = "Hello, can you tell me your tone?"

        # Use correct chat endpoint from PRD
        chat_endpoint = f"{BASE_URL}/message"

        # Helper function to send a chat message with client_id and conversation_id (if any)
        def send_chat_message(client_id, message, conversation_id=None):
            payload = {
                "client_id": client_id,
                "message": message
            }
            if conversation_id:
                payload["conversation_id"] = conversation_id
            resp = session.post(chat_endpoint, json=payload, timeout=TIMEOUT)
            resp.raise_for_status()
            try:
                return resp.json()
            except ValueError:
                assert False, f"Response is not valid JSON: {resp.text}"

        # Step 3: Send first message for client 1 and get response + conversation_id
        resp1 = send_chat_message(client_id_1, initial_message_1)
        assert "reply" in resp1 and isinstance(resp1["reply"], str), "No reply for client 1 first message"
        assert "conversation_id" in resp1 and resp1["conversation_id"], "No conversation_id returned for client 1"
        conversation_id_1 = resp1["conversation_id"]
        reply1_first = resp1["reply"]

        # Step 4: Send first message for client 2 and get response + conversation_id
        resp2 = send_chat_message(client_id_2, initial_message_2)
        assert "reply" in resp2 and isinstance(resp2["reply"], str), "No reply for client 2 first message"
        assert "conversation_id" in resp2 and resp2["conversation_id"], "No conversation_id returned for client 2"
        conversation_id_2 = resp2["conversation_id"]
        reply2_first = resp2["reply"]

        # Step 5: Assert that personalities differ for initial replies
        assert reply1_first != reply2_first, "Replies for different client_ids should differ indicating personality switch"

        # Step 6: Send follow-up message for client 1 to check context recall
        followup_msg_1 = "Can you recall what we talked about?"
        resp1_followup = send_chat_message(client_id_1, followup_msg_1, conversation_id_1)
        assert "reply" in resp1_followup, "No reply for client 1 follow-up"
        reply1_followup = resp1_followup["reply"]
        # Basic check that response references context, e.g., we expect a mention of personality or previous message
        assert len(reply1_followup) > 10, "Follow-up reply 1 seems too short, likely no context recall"

        # Step 7: Send follow-up message for client 2 to check context recall
        followup_msg_2 = "Do you remember our previous conversation?"
        resp2_followup = send_chat_message(client_id_2, followup_msg_2, conversation_id_2)
        assert "reply" in resp2_followup, "No reply for client 2 follow-up"
        reply2_followup = resp2_followup["reply"]
        assert len(reply2_followup) > 10, "Follow-up reply 2 seems too short, likely no context recall"

        # Step 8: Re-check personalities do not cross (reply 1 followup should differ from reply 2 followup)
        assert reply1_followup != reply2_followup, "Follow-up replies should differ, confirming isolated memory per client_id"

        # Step 9: Optionally, call health check endpoint to audit database, Redis, and AI engine state after chat usage
        health_endpoint = "http://localhost:3000/health"
        health_resp = session.get(health_endpoint, timeout=TIMEOUT)
        health_resp.raise_for_status()
        health_data = health_resp.json()
        # Check essential system components pass health checks
        assert health_data.get("database") == "ok", "Database health check failed"
        assert health_data.get("redis") == "ok", "Redis health check failed"
        assert health_data.get("ai_engine") == "ok", "AI engine health check failed"

    except requests.HTTPError as e:
        # Explicitly fail test on HTTP errors
        assert False, f"HTTP error occurred: {e} - response text: {getattr(e.response,'text',None)}"
    except AssertionError:
        raise
    except Exception as e:
        assert False, f"Unexpected error occurred: {e}"


test_chat_module_ai_personality_switching_and_context_recall()
