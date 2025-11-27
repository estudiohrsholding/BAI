"""
Analytics Service - Lógica de Negocio del Módulo Analytics

Este servicio orquesta toda la lógica relacionada con tracking y métricas:
- Registro de uso de features
- Agregación de métricas
- Cálculo de quotas y límites

Principio: Single Responsibility (SRP)
- Este servicio solo maneja la lógica de negocio de analytics
- No conoce detalles de HTTP (routes) ni de persistencia (repository)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select, func

from app.modules.analytics.models import UsageLog
from app.models.user import User, PlanTier, PLAN_FEATURE_MATRIX


class AnalyticsService:
    """
    Servicio de negocio para el módulo Analytics.
    
    Coordina la lógica de negocio de tracking y métricas sin conocer
    detalles de implementación de infraestructura (HTTP, base de datos).
    """
    
    def log_feature_usage(
        self,
        user_id: int,
        feature_key: str,
        session: Session,
        tracking_metadata: Optional[Dict[str, Any]] = None
    ) -> UsageLog:
        """
        Registra el uso de una feature premium.
        
        Args:
            user_id: ID del usuario
            feature_key: Clave de la feature (ej: "ai_content_generation")
            session: Sesión de base de datos
            tracking_metadata: Metadata adicional (modelo usado, tokens, etc.)
        
        Returns:
            UsageLog: Log creado
        """
        usage_log = UsageLog(
            user_id=user_id,
            feature_key=feature_key,
            tracking_metadata=tracking_metadata,
            timestamp=datetime.utcnow()
        )
        
        session.add(usage_log)
        session.commit()
        session.refresh(usage_log)
        
        return usage_log
    
    def get_usage_stats(
        self,
        user_id: int,
        feature_key: str,
        session: Session,
        period: str = "month"
    ) -> Dict[str, Any]:
        """
        Obtiene estadísticas de uso de una feature para un usuario.
        
        Args:
            user_id: ID del usuario
            feature_key: Clave de la feature
            session: Sesión de base de datos
            period: Período ("today", "week", "month")
        
        Returns:
            dict con count, period, limit
        """
        # Calcular fecha de inicio según período
        now = datetime.utcnow()
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "week":
            start_date = now - timedelta(days=7)
        elif period == "month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Contar usos en el período
        statement = select(func.count(UsageLog.id)).where(
            UsageLog.user_id == user_id,
            UsageLog.feature_key == feature_key,
            UsageLog.timestamp >= start_date
        )
        count = session.exec(statement).first() or 0
        
        # Obtener límite del plan del usuario
        user = session.exec(select(User).where(User.id == user_id)).first()
        limit = None
        if user:
            plan_features = PLAN_FEATURE_MATRIX.get(user.plan_tier, {})
            # El límite puede estar en max_chats o en un campo específico de la feature
            if feature_key == "ai_content_generation":
                limit = plan_features.get("max_chats")
        
        return {
            "feature_key": feature_key,
            "count": count,
            "period": period,
            "limit": limit
        }
    
    def get_dashboard_metrics(
        self,
        user_id: int,
        session: Session,
        worker_queue_size: int = 0,
        worker_status: str = "healthy"
    ) -> Dict[str, Any]:
        """
        Obtiene métricas agregadas para el dashboard.
        
        Args:
            user_id: ID del usuario
            session: Sesión de base de datos
            worker_queue_size: Tamaño de la cola de workers (desde health check)
            worker_status: Estado del worker (desde health check)
        
        Returns:
            dict con todas las métricas del dashboard
        """
        # Obtener usuario y plan
        user = session.exec(select(User).where(User.id == user_id)).first()
        if not user:
            raise ValueError(f"Usuario con ID {user_id} no encontrado")
        
        plan_features = PLAN_FEATURE_MATRIX.get(user.plan_tier, {})
        
        # Calcular conversiones (mock por ahora - puede venir de otra tabla)
        # TODO: Integrar con tabla de leads/conversiones cuando exista
        total_conversions = 0
        conversions_this_month = 0
        
        # Obtener estadísticas de uso para features premium
        usage_stats = []
        if user.plan_tier in [PlanTier.CEREBRO, PlanTier.PARTNER]:
            # Trackear uso de AI content generation
            ai_usage = self.get_usage_stats(
                user_id=user_id,
                feature_key="ai_content_generation",
                session=session,
                period="month"
            )
            usage_stats.append(ai_usage)
            
            # Trackear uso de data mining
            mining_usage = self.get_usage_stats(
                user_id=user_id,
                feature_key="access_mining",
                session=session,
                period="month"
            )
            usage_stats.append(mining_usage)
        
        # Construir límites del plan
        plan_limits = {
            "max_chats": plan_features.get("max_chats", 0),
            "access_mining": 1 if plan_features.get("access_mining") else 0,
            "access_marketing": 1 if plan_features.get("access_marketing") else 0,
        }
        
        return {
            "total_conversions": total_conversions,
            "conversions_this_month": conversions_this_month,
            "worker_status": worker_status,
            "worker_queue_size": worker_queue_size,
            "usage_stats": usage_stats,
            "current_plan": user.plan_tier.value,
            "plan_limits": plan_limits
        }

