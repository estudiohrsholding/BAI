"""add style field to contentpiece

Revision ID: e7f8g9h0i1j2
Revises: a1b2c3d4e5f6
Create Date: 2025-11-30 14:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e7f8g9h0i1j2'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Añadir campo style a la tabla contentpiece
    # Este campo indica el estilo de video: "cinematic" o "avatar"
    # Se usa para decidir qué herramienta de video usar en n8n
    op.add_column(
        'contentpiece',
        sa.Column('style', sa.String(length=50), nullable=True, server_default='cinematic')
    )


def downgrade() -> None:
    # Eliminar campo style
    op.drop_column('contentpiece', 'style')

