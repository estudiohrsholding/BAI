"""
Email Reports Tasks - Tareas de Envío de Emails

Tareas para enviar reportes y notificaciones por email en background.
"""

from typing import Dict, Any, Optional
import logging
import httpx

from app.core.config import settings


async def send_email_report(
    ctx: Dict[str, Any],
    email: str,
    content: str,
    subject: str = "B.A.I. Report"
) -> Dict[str, str]:
    """
    Envía un reporte por email en background.
    
    Actualmente usa n8n webhook para el envío real.
    En producción, puede integrarse con SendGrid, AWS SES, etc.
    
    Args:
        ctx: Contexto del worker (contiene Redis, logger, etc.)
        email: Email destino
        content: Contenido del email
        subject: Asunto del email
    
    Returns:
        Dict con status del envío:
        {
            "status": "sent" | "failed",
            "email": str,
            "error": Optional[str]
        }
    """
    logger = ctx.get("logger") or logging.getLogger("bai.worker.tasks")
    
    logger.info(
        f"Email sending - To: {email}, Subject: {subject}, Content length: {len(content)}"
    )
    
    try:
        # Usar n8n webhook para envío (mismo que EmailCommandHandler)
        n8n_webhook = "http://n8n:5678/webhook/send-report"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                n8n_webhook,
                json={
                    "email": email,
                    "subject": subject,
                    "content": content
                }
            )
            response.raise_for_status()
        
        logger.info(f"Email sent - To: {email}, Subject: {subject}")
        
        return {
            "status": "sent",
            "email": email
        }
    
    except httpx.TimeoutException as e:
        logger.error(f"Email timeout - To: {email}, Error: {str(e)}")
        return {
            "status": "failed",
            "email": email,
            "error": "Timeout al enviar email"
        }
    
    except httpx.RequestError as e:
        logger.error(f"Email request error - To: {email}, Error: {str(e)}")
        return {
            "status": "failed",
            "email": email,
            "error": f"Error de conexión: {str(e)}"
        }
    
    except Exception as e:
        logger.error(f"Email send failed - To: {email}, Error: {str(e)}")
        return {
            "status": "failed",
            "email": email,
            "error": str(e)
        }

