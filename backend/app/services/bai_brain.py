import os
import json
import httpx
import google.generativeai as genai
from fastapi.concurrency import run_in_threadpool
from sqlmodel import Session, select
from app.models.chat import ChatMessage
from app.models.log import SearchLog
from app.services.tools.search import search_brave
from app.core.database import engine


async def get_bai_response(user_input: str, session: Session, user_id: int) -> str:
  """
  Generates a response from B.A.I. using Google Gemini API with chat history.

  Args:
    user_input: The user's message/query
    session: Database session for persisting chat history
    user_id: The ID of the user making the request (for data isolation)

  Returns:
    The AI-generated response string, or a fallback message if API key is missing
  """
  # 1. Load Key
  api_key = os.environ.get("GOOGLE_API_KEY")
  if not api_key:
    return "System Alert: API Key missing."

  # 2. Tool Detection and Execution (Priority: n8n > search)
  input_lower = user_input.lower()
  n8n_data = None
  n8n_error = None
  search_results = None
  search_query = None

  # Priority 1: Check for Automation tool (n8n) - "diagnostico" or "test"
  if "diagnostico" in input_lower or "test" in input_lower:
    try:
      # Call n8n webhook using internal Docker hostname
      async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
          "http://n8n:5678/webhook/test",
          json={"user_input": user_input}
        )
        response.raise_for_status()
        n8n_data = response.json()
    except httpx.TimeoutException:
      n8n_error = "Timeout: The automation engine took too long to respond."
    except httpx.RequestError as e:
      n8n_error = f"Connection error: The automation engine is offline. ({str(e)})"
    except httpx.HTTPStatusError as e:
      n8n_error = f"HTTP error: The automation engine returned status {e.response.status_code}."
    except Exception as e:
      n8n_error = f"Unexpected error: {str(e)}"

  # Priority 2: Check for Data Mining tool (Brave Search) - search keywords
  # Only execute if n8n was not triggered
  if n8n_data is None and n8n_error is None:
    search_keywords = ["busca", "investiga", "analiza", "search", "find", "encuentra", "noticias"]
    detected_keyword = None
    
    for keyword in search_keywords:
      if keyword in input_lower:
        detected_keyword = keyword
        break
    
    if detected_keyword:
      # Extract query: remove the keyword and clean up
      # Handle both "busca X" and "X busca" patterns
      query_parts = input_lower.split(detected_keyword, 1)
      if len(query_parts) > 1:
        # Keyword found, extract the rest as query
        search_query = query_parts[1].strip()
      else:
        # Fallback: use the entire input as query
        search_query = user_input.strip()
      
      # Execute search
      if search_query:
        search_results = await search_brave(search_query, limit=5)
        
        # Log the search event to database
        if search_results and not search_results.startswith("Search failed"):
          # Create summary from search results (first 500 chars)
          summary = search_results[:500] if len(search_results) > 500 else search_results
          log_entry = SearchLog(
            query=search_query,
            summary=summary,
            status="completed",
            user_id=user_id
          )
          session.add(log_entry)
          session.commit()
        else:
          # Log failed search
          log_entry = SearchLog(
            query=search_query,
            summary=f"Search failed: {search_results[:200] if search_results else 'Unknown error'}",
            status="failed",
            user_id=user_id
          )
          session.add(log_entry)
          session.commit()

  # 3. Contextualize prompt for Gemini based on tool execution
  prompt_for_gemini = user_input
  
  # Priority: n8n results first
  if n8n_data is not None:
    prompt_for_gemini = (
      f"System Update: The user requested a system test. "
      f"I executed the n8n workflow. The tool returned: {json.dumps(n8n_data)}. "
      f"Please inform the user of this result naturally."
    )
  elif n8n_error is not None:
    prompt_for_gemini = (
      f"System Update: The user requested a system test. "
      f"I tried to execute the n8n workflow, but {n8n_error}. "
      f"Please inform the user that the automation engine is offline."
    )
  # Then: search results
  elif search_results is not None:
    prompt_for_gemini = (
      f"System Context: I have performed a web search for you. "
      f"Here are the results:\n{search_results}\n\n"
      f"Based on these results and your knowledge, answer the user's request: {user_input}"
    )

  def _generate_with_history():
    # Create a new thread-safe session for this thread pool execution
    # SQLModel/SQLAlchemy sessions are NOT thread-safe and must be created in the same thread
    with Session(engine) as thread_session:
      try:
        genai.configure(api_key=api_key)

        # 4. Fetch History: Get last 10 messages from DB for this user (most recent first)
        statement = (
          select(ChatMessage)
          .where(ChatMessage.user_id == user_id)
          .order_by(ChatMessage.timestamp.desc())
          .limit(10)
        )
        history_messages = thread_session.exec(statement).all()

        # Reverse to chronological order (oldest first) for Gemini
        history_messages = list(reversed(history_messages))

        # 5. Format for Gemini: Convert DB format to Gemini history format
        formatted_history = []
        for msg in history_messages:
          # DB role "user" -> Gemini role "user"
          # DB role "bai" -> Gemini role "model"
          gemini_role = "user" if msg.role == "user" else "model"
          formatted_history.append({
            "role": gemini_role,
            "parts": [msg.content]
          })

        # 6. Define Persona
        system_instruction = (
          "You are B.A.I. (Business Artificial Intelligence), a strategic business partner. "
          "You are friendly, empathetic, and highly technical. Think of yourself as 'The Friendly Sage' - "
          "wise, approachable, and genuinely invested in helping others succeed. "
          "You help the user with Automation (Service 1), Software (Service 2), and Data Mining (Service 3). "
          "Keep answers concise, professional, yet warm. Never be robotic - be conversational and human-like.\n\n"
          "PROTOCOL: AUTOMATION CONSULTATION\n"
          "When a user says 'Quiero automatizar mi negocio', 'Inicia el análisis', or requests automation analysis:\n\n"
          "Step 1: Acknowledge their enthusiasm warmly. Express genuine interest in helping them streamline their business.\n\n"
          "Step 2: Ask for their EMAIL address. Say something like: 'I'd love to send you a detailed analysis report. "
          "Could you share your email address so I can send it to you once we're done?'\n\n"
          "Step 3: Once they provide their email, ask 2-3 thoughtful questions about:\n"
          "  - Their business type/industry\n"
          "  - Repetitive tasks or processes they'd like to automate\n"
          "  - Current pain points or time-consuming activities\n"
          "Make this conversational - don't just list questions. Engage with them naturally.\n\n"
          "Step 4: After they answer, analyze their responses and propose 2-3 specific automation ideas. "
          "Mention n8n workflows or AI Agents where relevant. Be creative but practical.\n\n"
          "Step 5: Conclude by saying something like: 'Perfect! I'm preparing your personalized automation report "
          "and sending it to your email right now. You should receive it shortly.' "
          "(Note: This is simulated - don't actually send emails, just acknowledge that you're doing it.)\n\n"
          "Remember: Stay conversational, empathetic, and enthusiastic. You're The Friendly Sage guiding them, "
          "not a cold automation bot. Make them feel heard and supported throughout the process."
        )

        # 7. Use a Valid Model from the list (Gemini 2.5 Flash) with system instruction
        model = genai.GenerativeModel(
          "gemini-2.5-flash",
          system_instruction=system_instruction
        )

        # 8. Start Chat with history
        chat = model.start_chat(history=formatted_history)

        # 9. Generate response (use contextualized prompt if n8n was called)
        response = chat.send_message(prompt_for_gemini)

        # 10. Save Persistence: Create ChatMessage for user input
        user_message = ChatMessage(role="user", content=user_input, user_id=user_id)
        thread_session.add(user_message)

        # 11. Save Persistence: Create ChatMessage for BAI response
        bai_response_text = response.text
        bai_message = ChatMessage(role="bai", content=bai_response_text, user_id=user_id)
        thread_session.add(bai_message)

        # 12. Commit the session
        thread_session.commit()

        return bai_response_text

      except Exception as e:
        thread_session.rollback()
        return f"I'm having a glitch connecting to my new brain (Gemini 2.5): {str(e)}"

  # 13. Execute in threadpool
  return await run_in_threadpool(_generate_with_history)