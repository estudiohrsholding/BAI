"""
Neural Core

Pure neural engine for Gemini API interactions.
Agnostic to context - works for both internal chatbot and external widgets.
"""

import os
import re
import httpx
import google.generativeai as genai
from typing import List, Dict, Any, Optional, Tuple


class EmailCommandHandler:
    """Handles email trigger commands from AI responses."""
    
    EMAIL_PATTERN = re.compile(r"\|\|SEND_EMAIL: (.+?)\|\|")
    N8N_EMAIL_WEBHOOK = "http://n8n:5678/webhook/send-report"
    WEBHOOK_TIMEOUT = 2.0
    
    @classmethod
    def extract_and_clean(cls, text: str) -> Tuple[str, Optional[str]]:
        """
        Extract email command from text and return cleaned text + email.
        
        Args:
            text: Response text that may contain email command
            
        Returns:
            Tuple of (cleaned_text, email) or (text, None) if no command found
        """
        match = cls.EMAIL_PATTERN.search(text)
        if match:
            email = match.group(1).strip()
            cleaned_text = text.replace(match.group(0), "").strip()
            return cleaned_text, email
        return text, None
    
    @classmethod
    def trigger_email_webhook(cls, email: str, content: str) -> None:
        """
        Trigger n8n webhook to send email (fire and forget).
        
        Args:
            email: Target email address
            content: Email content
        """
        try:
            with httpx.Client(timeout=cls.WEBHOOK_TIMEOUT) as client:
                client.post(
                    cls.N8N_EMAIL_WEBHOOK,
                    json={
                        "email": email,
                        "subject": "Tu Informe de Inteligencia B.A.I.",
                        "content": content
                    }
                )
        except Exception as e:
            # Log error but don't fail - this is fire and forget
            print(f"Failed to trigger email webhook: {e}")


class NeuralCore:
    """Pure neural engine for Gemini API interactions."""
    
    MODEL_NAME = "gemini-2.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize neural core.
        
        Args:
            api_key: Google API key (if None, reads from environment)
        """
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment or provided")
        
        genai.configure(api_key=self.api_key)
    
    def generate_with_history(
        self,
        user_input: str,
        system_instruction: str,
        history: List[Dict[str, Any]],
        context_update: Optional[str] = None
    ) -> str:
        """
        Generate response with chat history (for internal chatbot).
        
        Uses a concatenated "super prompt" approach for better context retention
        with Gemini Flash models, instead of native history format.
        
        Args:
            user_input: User's message
            system_instruction: System prompt/persona
            history: Formatted chat history for Gemini
            context_update: Optional context from tool execution
            
        Returns:
            AI-generated response text
        """
        # Build conversation context manually as plain text
        # This ensures Gemini Flash reads ALL history, not just recent messages
        conversation_context = f"SYSTEM INSTRUCTION:\n{system_instruction}\n\nCONVERSATION HISTORY:\n"
        
        # Convert history to plain text format
        for msg in history:
            role = msg.get('role', 'user')
            # Extract content from 'parts' array if present, otherwise use direct content
            parts = msg.get('parts', [])
            if parts:
                content = parts[0] if isinstance(parts, list) and len(parts) > 0 else str(parts)
            else:
                content = msg.get('content', '')
            
            role_label = "[User]" if role == 'user' else "[AI]"
            conversation_context += f"{role_label}: {content}\n"
        
        # Add current user message
        current_message = context_update if context_update else user_input
        final_prompt = f"{conversation_context}\n[User]: {current_message}\n[AI]:"
        
        # Create model with system instruction
        model = genai.GenerativeModel(
            self.MODEL_NAME,
            system_instruction=system_instruction
        )
        
        # Generate response using the concatenated prompt (no native history)
        # This forces Gemini to read ALL context in one go
        response = model.generate_content(final_prompt)
        
        return response.text
    
    def generate_stateless(
        self,
        context_prompt: Optional[str] = None,
        user_message: Optional[str] = None,
        user_input: Optional[str] = None,
        system_instruction: Optional[str] = None
    ) -> str:
        """
        Generate response without history (for widgets).
        
        Supports two calling patterns:
        1. With pre-formatted context: context_prompt + user_message
        2. Simple stateless: user_input + system_instruction
        
        Args:
            context_prompt: Pre-formatted context (history + system prompt) - for widgets
            user_message: Current user message - for widgets
            user_input: User's message - for simple stateless
            system_instruction: System prompt/persona - for simple stateless
            
        Returns:
            AI-generated response text
        """
        # Pattern 1: Pre-formatted context (widget with history)
        if context_prompt and user_message:
            # Combine context (History + System) with current message
            final_prompt = f"{context_prompt}\n[Usuario]: {user_message}\n[Agente]:"
            
            model = genai.GenerativeModel(self.MODEL_NAME)
            response = model.generate_content(final_prompt)
            return response.text
        
        # Pattern 2: Simple stateless (backward compatibility)
        if user_input and system_instruction:
            model = genai.GenerativeModel(
                self.MODEL_NAME,
                system_instruction=system_instruction
            )
            response = model.generate_content(user_input)
            return response.text
        
        raise ValueError("Invalid arguments: provide either (context_prompt, user_message) or (user_input, system_instruction)")
    
    @staticmethod
    def format_history_as_context(history: List[Dict[str, Any]], system_prompt: str) -> str:
        """
        Helper to convert JSON history to text block for Flash models.
        
        Args:
            history: List of message dictionaries with 'role' and 'content' keys
            system_prompt: System instruction/persona
            
        Returns:
            Formatted context string ready for Gemini
        """
        context = f"INSTRUCCIONES DEL SISTEMA:\n{system_prompt}\n\nHISTORIAL DE CONVERSACIÓN:\n"
        
        for msg in history:
            role = msg.get('role', 'user')
            # Extract content from 'parts' array if present, otherwise use direct content
            parts = msg.get('parts', [])
            if parts:
                content = parts[0] if isinstance(parts, list) and len(parts) > 0 else str(parts)
            else:
                content = msg.get('content', '')
            
            role_label = "[Usuario]" if role == 'user' else "[Agente]"
            context += f"{role_label}: {content}\n"
        
        return context
    
    @staticmethod
    def process_response(response_text: str) -> Tuple[str, Optional[str]]:
        """
        Process AI response: extract email command and clean text.
        
        Args:
            response_text: Raw AI response
            
        Returns:
            Tuple of (cleaned_text, email) or (text, None)
        """
        return EmailCommandHandler.extract_and_clean(response_text)

