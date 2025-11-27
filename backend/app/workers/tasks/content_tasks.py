"""
Content Tasks - Tareas Asíncronas para Generación de Contenido

Tareas de worker para generación de contenido de influencers IA.
Simula llamadas a APIs externas (DALL-E 3, HeyGen, etc.) con tiempos de procesamiento realistas.
"""

from typing import Dict, Any
from datetime import datetime, timedelta
import asyncio
import httpx

from sqlmodel import select

from app.modules.content_creator.service import ContentCreatorService
from app.modules.content_creator.models import CampaignStatus, Campaign
from app.modules.content_planner.service import ContentPlannerService
from app.modules.content_planner.models import CampaignStatus as PlannerCampaignStatus, ContentCampaign
from app.infrastructure.db.session import get_session
from app.core.config import settings


async def generate_influencer_content(
    ctx,
    campaign_id: int
) -> Dict[str, Any]:
    """
    Tarea asíncrona para generar contenido de influencer IA.
    
    Esta tarea simula el proceso completo de generación de contenido:
    1. Generación de imágenes (DALL-E 3)
    2. Generación de videos (HeyGen)
    3. Generación de textos/captions (Gemini)
    4. Optimización para cada plataforma
    
    Tiempo estimado: 10-20 segundos por pieza de contenido.
    
    Args:
        ctx: Contexto del worker (Arq)
        campaign_id: ID de la campaña a procesar
    
    Returns:
        dict con resultado del procesamiento
    """
    try:
        # Obtener sesión de base de datos
        with get_session() as session:
            service = ContentCreatorService()
            
            # Obtener campaña
            campaign = session.exec(
                select(Campaign).where(Campaign.id == campaign_id)
            ).first()
            
            if not campaign:
                return {
                    "success": False,
                    "error": f"Campaña con ID {campaign_id} no encontrada",
                    "campaign_id": campaign_id
                }
            
            # Actualizar estado a IN_PROGRESS
            service.update_campaign_status(
                campaign_id=campaign_id,
                status=CampaignStatus.IN_PROGRESS,
                session=session
            )
            
            # Simular generación de contenido
            # Tiempo: 10-20 segundos por pieza
            total_time = campaign.content_count * 15  # Promedio de 15 segundos
            
            # Simular progreso (actualizar cada 5 segundos)
            steps = total_time // 5
            for step in range(steps):
                await asyncio.sleep(5)
                # Aquí podrías actualizar un campo de progreso si lo agregas al modelo
            
            # Generar contenido simulado
            generated_content = {
                "platforms": {},
                "total_pieces": campaign.content_count,
                "generated_at": datetime.utcnow().isoformat()
            }
            
            for platform in campaign.platforms:
                platform_content = []
                for i in range(campaign.content_count):
                    piece = {
                        "id": f"{platform.lower()}_{i+1}",
                        "type": "image" if platform in ["Instagram", "Facebook"] else "video" if platform == "TikTok" else "post",
                        "url": f"https://cdn.example.com/content/{campaign_id}/{platform.lower()}_{i+1}.jpg",
                        "caption": f"Contenido generado para {campaign.influencer_name} - {campaign.tone_of_voice}",
                        "scheduled_for": None,  # Se puede programar después
                        "status": "ready"
                    }
                    platform_content.append(piece)
                
                generated_content["platforms"][platform] = platform_content
            
            # Actualizar estado a COMPLETED
            service.update_campaign_status(
                campaign_id=campaign_id,
                status=CampaignStatus.COMPLETED,
                session=session,
                generated_content=generated_content
            )
            
            return {
                "success": True,
                "campaign_id": campaign_id,
                "content_pieces": campaign.content_count,
                "platforms": campaign.platforms,
                "generated_at": datetime.utcnow().isoformat()
            }
    
    except Exception as e:
        # Actualizar estado a FAILED si hay error
        try:
            with get_session() as session:
                service = ContentCreatorService()
                service.update_campaign_status(
                    campaign_id=campaign_id,
                    status=CampaignStatus.FAILED,
                    session=session,
                    error_message=str(e)
                )
        except Exception:
            pass  # Si falla la actualización, al menos loguear el error
        
        return {
            "success": False,
            "error": str(e),
            "campaign_id": campaign_id
        }


async def schedule_monthly_content(
    ctx,
    campaign_id: int
) -> Dict[str, Any]:
    """
    Tarea asíncrona para despachar generación de contenido mensual a n8n.
    
    Esta tarea:
    1. Obtiene la campaña de la base de datos
    2. Construye el payload con los datos necesarios
    3. Envía una petición POST a n8n con el webhook de generación
    4. Actualiza el estado a PROCESSING_REMOTE (esperando callback de n8n)
    
    **IMPORTANTE:** Esta tarea NO genera el contenido directamente.
    El contenido será generado por n8n y enviado de vuelta vía callback.
    
    Args:
        ctx: Contexto del worker (Arq)
        campaign_id: ID de la campaña mensual a procesar
    
    Returns:
        dict con resultado del despacho a n8n
    """
    try:
        # Obtener sesión de base de datos
        with get_session() as session:
            service = ContentPlannerService()
            
            # Obtener campaña
            campaign = session.exec(
                select(ContentCampaign).where(ContentCampaign.id == campaign_id)
            ).first()
            
            if not campaign:
                return {
                    "success": False,
                    "error": f"Campaña mensual con ID {campaign_id} no encontrada",
                    "campaign_id": campaign_id
                }
            
            # Verificar que n8n webhook esté configurado
            if not settings.N8N_GENERATION_WEBHOOK_URL:
                raise ValueError(
                    "N8N_GENERATION_WEBHOOK_URL no está configurado. "
                    "Por favor, configura la URL del webhook de n8n en las variables de entorno."
                )
            
            # Construir callback URL (donde n8n enviará los resultados)
            callback_url = f"{settings.DOMAIN}/api/v1/content-planner/webhook/callback"
            
            # Construir payload para n8n
            # Nota: El payload incluye 'topic' como alias de 'themes' para compatibilidad con n8n
            payload = {
                "campaign_id": campaign_id,
                "topic": ", ".join(campaign.themes),  # Temas como string para n8n
                "tone": campaign.tone_of_voice,  # Alias 'tone' para n8n
                "platform": campaign.target_platforms[0] if campaign.target_platforms else "Instagram",  # Plataforma principal
                "platforms": campaign.target_platforms,  # Todas las plataformas
                "month": campaign.month,
                "themes": campaign.themes,
                "tone_of_voice": campaign.tone_of_voice,
                "callback_url": callback_url,
                "campaign_metadata": campaign.campaign_metadata or {}
            }
            
            # Actualizar estado a IN_PROGRESS antes de enviar a n8n
            service.update_campaign_status(
                campaign_id=campaign_id,
                status=PlannerCampaignStatus.IN_PROGRESS,
                session=session
            )
            
            # Enviar petición a n8n
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    settings.N8N_GENERATION_WEBHOOK_URL,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "B.A.I.-Platform/1.0"
                    }
                )
                
                # Log de respuesta de n8n
                print(f"[n8n Dispatch] Campaign {campaign_id}: n8n responded with status {response.status_code}")
                
                # Verificar respuesta de n8n
                if response.status_code not in [200, 201, 202]:
                    raise ValueError(
                        f"n8n webhook retornó status {response.status_code}: {response.text}"
                    )
                
                # IMPORTANTE: El estado permanece 'IN_PROGRESS' después de enviar a n8n
                # El callback de n8n cambiará el estado a 'COMPLETED' cuando llegue el contenido
            
            return {
                "success": True,
                "campaign_id": campaign_id,
                "month": campaign.month,
                "n8n_response_status": response.status_code,
                "message": "Campaña despachada a n8n. Esperando callback con contenido generado.",
                "dispatched_at": datetime.utcnow().isoformat()
            }
    
    except Exception as e:
        # Actualizar estado a FAILED si hay error
        try:
            with get_session() as session:
                service = ContentPlannerService()
                service.update_campaign_status(
                    campaign_id=campaign_id,
                    status=PlannerCampaignStatus.FAILED,
                    session=session,
                    error_message=str(e)
                )
        except Exception:
            pass  # Si falla la actualización, al menos loguear el error
        
        return {
            "success": False,
            "error": str(e),
            "campaign_id": campaign_id
        }

