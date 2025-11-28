"""add_missing_indexes_for_performance

Revision ID: a022b4860535
Revises: 5eaac8d22173
Create Date: 2025-11-28 00:23:42.471120
"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'a022b4860535'
down_revision = '5eaac8d22173'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Añade índices faltantes para mejorar performance en queries frecuentes.
    
    Índices añadidos:
    1. content_planner_campaigns.month - Para filtros temporales
    2. users.plan_tier - Para feature gating y filtrado por plan
    3. extraction_queries.search_topic - Para búsquedas (opcional, búsquedas de texto)
    """
    # Índice en ContentCampaign.month (usado en filtros temporales)
    op.create_index(
        'ix_content_planner_campaigns_month',
        'content_planner_campaigns',
        ['month'],
        unique=False,
        if_not_exists=True
    )
    
    # Índice en User.plan_tier (usado en feature gating)
    op.create_index(
        'ix_users_plan_tier',
        'users',
        ['plan_tier'],
        unique=False,
        if_not_exists=True
    )
    
    # Nota: search_topic no necesita índice completo porque es búsqueda de texto parcial
    # Un índice completo sería demasiado pesado. Si necesitamos búsqueda de texto,
    # deberíamos usar PostgreSQL full-text search (GIN index) en lugar de un índice B-tree.


def downgrade() -> None:
    """
    Elimina los índices añadidos.
    """
    op.drop_index(
        'ix_content_planner_campaigns_month',
        table_name='content_planner_campaigns',
        if_exists=True
    )
    
    op.drop_index(
        'ix_users_plan_tier',
        table_name='users',
        if_exists=True
    )

