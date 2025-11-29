"""add credits fields to user

Revision ID: 685e85bae337
Revises: a022b4860535
Create Date: 2025-11-28 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '685e85bae337'
down_revision = 'a022b4860535'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Añadir campos de créditos mensuales (se resetean cada mes)
    op.add_column('user', sa.Column('monthly_credits_video', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('monthly_credits_image', sa.Integer(), nullable=False, server_default='0'))
    
    # Añadir campos de créditos extra (comprados - nunca caducan)
    op.add_column('user', sa.Column('extra_credits_video', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('extra_credits_image', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Eliminar campos de créditos
    op.drop_column('user', 'extra_credits_image')
    op.drop_column('user', 'extra_credits_video')
    op.drop_column('user', 'monthly_credits_image')
    op.drop_column('user', 'monthly_credits_video')

