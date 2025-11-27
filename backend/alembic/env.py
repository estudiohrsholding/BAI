import asyncio
from logging.config import fileConfig
from typing import Any, Dict

from alembic import context
from sqlalchemy import create_engine
from sqlalchemy import pool
from sqlmodel import SQLModel

from app.core.config import settings
from app.infrastructure.db.base import BaseModel  # noqa: F401
from app.models import user as user_models  # noqa: F401
from app.models import chat as legacy_chat_models  # noqa: F401
from app.modules.chat import models as chat_models  # noqa: F401
from app.modules.analytics import models as analytics_models  # noqa: F401
from app.modules.content_creator import models as content_models  # noqa: F401
from app.modules.data_mining import models as data_mining_models  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

db_url = str(settings.DATABASE_URL)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
config.set_main_option("sqlalchemy.url", db_url)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url") or str(settings.DATABASE_URL)
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(
        db_url,
        poolclass=pool.NullPool,
        future=True,
    )

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

