"""add marketing campaigns and content pieces

Revision ID: a1b2c3d4e5f6
Revises: 685e85bae337
Create Date: 2025-11-28 14:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '685e85bae337'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Crear tabla marketingcampaign
    op.create_table(
        'marketingcampaign',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('influencer_name', sa.String(length=255), nullable=False),
        sa.Column('tone_of_voice', sa.String(length=100), nullable=False),
        sa.Column('topic', sa.String(), nullable=False),
        sa.Column('platforms', sa.String(length=500), nullable=False),
        sa.Column('content_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('marketingcampaign_user_id_fkey')),
        sa.PrimaryKeyConstraint('id', name=op.f('marketingcampaign_pkey'))
    )
    op.create_index(op.f('ix_marketingcampaign_user_id'), 'marketingcampaign', ['user_id'], unique=False)
    
    # Crear tabla contentpiece
    op.create_table(
        'contentpiece',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('campaign_id', sa.Integer(), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('caption', sa.String(), nullable=False),
        sa.Column('visual_script', sa.String(), nullable=False),
        sa.Column('media_url', sa.String(length=1000), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['campaign_id'], ['marketingcampaign.id'], name=op.f('contentpiece_campaign_id_fkey')),
        sa.PrimaryKeyConstraint('id', name=op.f('contentpiece_pkey'))
    )
    op.create_index(op.f('ix_contentpiece_campaign_id'), 'contentpiece', ['campaign_id'], unique=False)


def downgrade() -> None:
    # Eliminar tablas en orden inverso (primero contentpiece, luego marketingcampaign)
    op.drop_index(op.f('ix_contentpiece_campaign_id'), table_name='contentpiece')
    op.drop_table('contentpiece')
    op.drop_index(op.f('ix_marketingcampaign_user_id'), table_name='marketingcampaign')
    op.drop_table('marketingcampaign')

