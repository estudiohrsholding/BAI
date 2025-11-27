"""add_processing_remote_and_review_ready_status

Revision ID: 5eaac8d22173
Revises: 66986bc6a920
Create Date: 2025-11-27 21:30:40.318462
"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '5eaac8d22173'
down_revision = '66986bc6a920'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Agregar nuevos valores al enum 'campaignstatus'
    # PostgreSQL requiere usar ALTER TYPE ... ADD VALUE dentro de una transacción
    op.execute("ALTER TYPE campaignstatus ADD VALUE IF NOT EXISTS 'PROCESSING_REMOTE'")
    op.execute("ALTER TYPE campaignstatus ADD VALUE IF NOT EXISTS 'REVIEW_READY'")


def downgrade() -> None:
    # NOTA: PostgreSQL no permite eliminar valores de un enum directamente.
    # Para hacer downgrade, necesitarías recrear el enum completo.
    # Por ahora, dejamos los valores en el enum (no hay problema de compatibilidad).
    # Si realmente necesitas eliminarlos, deberías:
    # 1. Crear un nuevo enum sin esos valores
    # 2. Actualizar todas las columnas que usan el enum
    # 3. Eliminar el enum viejo
    # 4. Renombrar el nuevo enum
    pass

