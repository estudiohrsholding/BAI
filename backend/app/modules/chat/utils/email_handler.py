"""
Email Command Handler

Maneja comandos de email ocultos en las respuestas de IA.
Migrado desde backend/app/services/brain/core.py
"""

import re
import httpx
from typing import Tuple, Optional


class EmailCommandHandler:
    """
    Maneja comandos de email ocultos en las respuestas de IA.
    
    Detecta el patrón ||SEND_EMAIL: <email>|| y lo procesa silenciosamente.
    """
    
    EMAIL_PATTERN = re.compile(r"\|\|SEND_EMAIL: (.+?)\|\|")
    N8N_EMAIL_WEBHOOK = "http://n8n:5678/webhook/send-report"
    WEBHOOK_TIMEOUT = 2.0
    
    @classmethod
    def extract_and_clean(cls, text: str) -> Tuple[str, Optional[str]]:
        """
        Extrae el comando de email del texto y retorna el texto limpio + email.
        
        Args:
            text: Texto de respuesta que puede contener comando de email
            
        Returns:
            Tuple de (texto_limpio, email) o (texto, None) si no se encuentra comando
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
        Dispara el webhook de n8n para enviar email (fire and forget).
        
        Args:
            email: Email destino
            content: Contenido del email
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

