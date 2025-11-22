# B.A.I. Monorepo

Fundación del proyecto Business Artificial Intelligence (B.A.I.) con arquitectura monorepo que aloja un frontend en Next.js y un backend en FastAPI, listos para ejecutarse mediante Docker Compose junto a PostgreSQL.

## Estructura

- `frontend/`: Next.js 14 + Tailwind + shadcn/ui base
- `backend/`: FastAPI con Pydantic Settings y endpoint de salud
- `docker-compose.yml`: orquestación de frontend, backend y base de datos

## Puesta en marcha

```bash
docker compose up --build
```

Frontend disponible en `http://localhost:3000`, backend en `http://localhost:8000`, Base de datos en `localhost:5432`.
