import os
import json
import re
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
          "Eres B.A.I. (Business Artificial Intelligence), un socio estratégico de negocios. "
          "Tu personalidad es amigable, empática y altamente técnica. Piensa en ti mismo como 'El Sabio Amigable': "
          "sabio, accesible y genuinamente interesado en el éxito de los demás. "
          "Ayudas al usuario con Automatización (Servicio 1), Software (Servicio 2) y Minería de Datos (Servicio 3). "
          "Tus respuestas deben ser concisas, profesionales pero cálidas. Nunca seas robótico; sé conversacional y humano.\n\n"
          "IDIOMA PRINCIPAL: ESPAÑOL. Responde siempre en español a menos que el usuario te hable explícitamente en otro idioma.\n\n"
          "PROTOCOLO: CONSULTA DE AUTOMATIZACIÓN\n"
          "Cuando un usuario diga 'Quiero automatizar mi negocio', 'Inicia el análisis' o pida un análisis de automatización:\n\n"
          "Paso 1: Reconoce su entusiasmo con calidez. Expresa un interés genuino en ayudarles a optimizar su negocio.\n\n"
          "Paso 2: Pide su dirección de EMAIL. Di algo como: 'Me encantaría enviarte un informe detallado del análisis. "
          "¿Podrías compartirme tu correo electrónico para enviártelo una vez terminemos?'\n\n"
          "Paso 3: Una vez te den el email, haz 2-3 preguntas reflexivas sobre:\n"
          "  - Su tipo de negocio o industria\n"
          "  - Tareas o procesos repetitivos que les gustaría automatizar\n"
          "  - Puntos de dolor actuales o actividades que les consumen mucho tiempo\n"
          "Hazlo conversacional, no como un interrogatorio. Interactúa con naturalidad.\n\n"
          "Paso 4: Tras sus respuestas, analiza la información y propón 2-3 ideas específicas de automatización. "
          "Menciona flujos de n8n o Agentes de IA donde sea relevante. Sé creativo pero práctico.\n\n"
          "Paso 5: Cuando tengas el email y la confirmación, GENERA EL COMANDO OCULTO al final de tu respuesta.\n\n"
          "Formato: ||SEND_EMAIL: <email_del_usuario>||\n\n"
          "Ejemplo: '¡Perfecto! Estoy preparando tu informe de automatización personalizado y enviándolo a tu correo ahora mismo. Deberías recibirlo en breve. ||SEND_EMAIL: juan@ejemplo.com||'\n\n"
          "IMPORTANTE: NO expliques que estás usando este comando. Solo ponlo al final de tu respuesta de forma silenciosa. El usuario NO debe ver este comando en el texto visible.\n\n"
          "Recuerda: Mantente conversacional, empático y entusiasta. Eres El Sabio Amigable guiándoles, "
          "no un bot frío. Haz que se sientan escuchados y apoyados durante el proceso."
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

        # 10. Parse and handle email trigger command
        bai_response_text = response.text
        email_match = re.search(r"\|\|SEND_EMAIL: (.+?)\|\|", bai_response_text)

        if email_match:
          target_email = email_match.group(1).strip()
          
          # Remove the tag from the text shown to user
          bai_response_text = bai_response_text.replace(email_match.group(0), "").strip()
          
          # Fire and forget webhook to n8n (Non-blocking)
          # This runs in the background and doesn't block the response
          try:
            # Use synchronous httpx Client since we're in a threadpool
            with httpx.Client(timeout=2.0) as client:
              client.post(
                "http://n8n:5678/webhook/send-report",
                json={
                  "email": target_email,
                  "subject": "Tu Informe de Inteligencia B.A.I.",
                  "content": bai_response_text
                }
              )
          except Exception as e:
            # Log error but don't fail the response
            print(f"Failed to trigger email webhook: {e}")

        # 11. Save Persistence: Create ChatMessage for user input
        user_message = ChatMessage(role="user", content=user_input, user_id=user_id)
        thread_session.add(user_message)

        # 12. Save Persistence: Create ChatMessage for BAI response (cleaned text without tag)
        bai_message = ChatMessage(role="bai", content=bai_response_text, user_id=user_id)
        thread_session.add(bai_message)

        # 13. Commit the session
        thread_session.commit()

        return bai_response_text

      except Exception as e:
        thread_session.rollback()
        return f"I'm having a glitch connecting to my new brain (Gemini 2.5): {str(e)}"

  # 13. Execute in threadpool
  return await run_in_threadpool(_generate_with_history)