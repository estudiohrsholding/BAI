from contextlib import asynccontextmanager
from typing import List, Dict, Any
from fastapi import FastAPI, Depends, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.router import router as api_router
from app.api.routes import auth as auth_router
from app.api.routes import data as data_router
from app.api.routes import billing as billing_router
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import create_db_and_tables, get_session
from app.services.bai_brain import get_bai_response, get_widget_response
from app.models.chat import ChatMessage  # Import to register the model
from app.models.user import User  # Import to register the model
from app.models.log import SearchLog  # Import to register the model


class ChatRequest(BaseModel):
  text: str


class WidgetChatRequest(BaseModel):
  message: str
  client_id: str
  history: List[Dict[str, Any]] = []  # Historial de conversación para contexto


@asynccontextmanager
async def lifespan(app: FastAPI):
  # Startup: Create database tables
  create_db_and_tables()
  yield
  # Shutdown: (if needed, cleanup code goes here)


def create_app() -> FastAPI:
  application = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
  )
  configure_cors(application)
  configure_routes(application)
  return application


class SelectiveCORSMiddleware(BaseHTTPMiddleware):
  """
  Middleware CORS selectivo que aplica diferentes políticas según la ruta.
  
  SEGURIDAD DEFENSE-IN-DEPTH:
  - Endpoints públicos (widget): CORS abierto ["*"] para multi-tenencia
  - Endpoints autenticados: CORS restringido a orígenes específicos
  
  Esto previene que sitios maliciosos hagan peticiones a endpoints autenticados,
  incluso si tienen un JWT válido (robado o filtrado).
  """
  
  # Endpoint público del widget (permite cualquier origen)
  PUBLIC_WIDGET_PATH = "/api/v1/widget/chat"
  
  # Orígenes permitidos para endpoints autenticados (B.A.I. Platform)
  TRUSTED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://baibussines.com",  # Production (B.A.I. Platform)
    "https://www.baibussines.com",  # Production (con www)
  ]
  
  async def dispatch(self, request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Determinar si es endpoint público o autenticado
    is_public_widget = request.url.path == self.PUBLIC_WIDGET_PATH
    
    # Preparar headers CORS según el tipo de endpoint
    if is_public_widget:
      # Endpoint público: permitir cualquier origen (multi-tenencia)
      cors_headers = {
        "Access-Control-Allow-Origin": origin if origin else "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "false",
      }
    else:
      # Endpoints autenticados: solo orígenes confiables
      if origin and origin in self.TRUSTED_ORIGINS:
        cors_headers = {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Credentials": "true",
        }
      else:
        # Origen no confiable: no permitir CORS (pero no bloquear la petición)
        # El endpoint autenticado rechazará si no hay token válido
        cors_headers = {}
    
    # Manejar preflight OPTIONS
    if request.method == "OPTIONS":
      response = Response()
      response.headers.update(cors_headers)
      return response
    
    # Procesar la petición normal
    response = await call_next(request)
    
    # Añadir headers CORS a la respuesta
    response.headers.update(cors_headers)
    
    return response


def configure_cors(app: FastAPI) -> None:
  """
  Configuración de CORS selectiva por ruta.
  
  SEGURIDAD DEFENSE-IN-DEPTH:
  - Endpoints públicos (widget): CORS abierto ["*"] para multi-tenencia
  - Endpoints autenticados: CORS restringido a orígenes confiables
  
  Esto previene que sitios maliciosos hagan peticiones a endpoints autenticados,
  incluso si tienen un JWT válido (robado o filtrado).
  
  PLATAFORMA MULTI-TENENCIA:
  - El widget público puede embeberse en cualquier dominio de cliente
  - Los endpoints autenticados solo aceptan peticiones desde B.A.I. Platform
  
  IMPLEMENTACIÓN:
  - Usa middleware personalizado que verifica la ruta antes de aplicar CORS
  - Solo /api/v1/widget/chat permite cualquier origen
  - Todos los demás endpoints requieren orígenes confiables
  """
  # Middleware personalizado que aplica CORS selectivo según la ruta
  app.add_middleware(SelectiveCORSMiddleware)


def configure_routes(app: FastAPI) -> None:
  app.add_api_route("/", root, methods=["GET"], summary="Root")
  app.add_api_route("/health", health_check, methods=["GET"], summary="Health check endpoint")
  app.add_api_route("/api/chat", chat_endpoint, methods=["POST"], summary="Chat endpoint")
  app.add_api_route("/api/chat/history", chat_history_endpoint, methods=["GET"], summary="Chat history endpoint")
  app.add_api_route("/api/v1/widget/chat", widget_chat_endpoint, methods=["POST"], summary="Widget chat endpoint (public)")
  app.include_router(api_router)
  app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
  app.include_router(data_router.router, prefix="/api/data", tags=["data"])
  app.include_router(billing_router.router, prefix="/api/billing", tags=["billing"])


async def root() -> dict[str, str]:
  return {"message": "Welcome to B.A.I. Partner API"}


async def health_check() -> dict[str, str]:
  """
  Health check endpoint.
  Returns 200 OK if the service is running.
  """
  return {"status": "ok", "service": "BAI_Backend_v1"}


async def chat_endpoint(
  request: ChatRequest,
  current_user: User = Depends(get_current_user),
  session: Session = Depends(get_session)
) -> dict[str, str]:
  """
  Chat endpoint - protected by authentication.
  Requires a valid Bearer token in Authorization header.
  """
  response = await get_bai_response(request.text, session, current_user.id)
  return {"response": response}


async def chat_history_endpoint(
  current_user: User = Depends(get_current_user),
  session: Session = Depends(get_session)
) -> list[dict]:
  """
  Get chat history ordered by timestamp (ascending).
  Protected by authentication - requires a valid Bearer token.
  
  Returns only chat messages for the current authenticated user.
  """
  statement = (
    select(ChatMessage)
    .where(ChatMessage.user_id == current_user.id)
    .order_by(ChatMessage.timestamp.asc())
  )
  messages = session.exec(statement).all()
  
  return [
    {
      "id": msg.id,
      "role": msg.role,
      "content": msg.content,
      "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
    }
    for msg in messages
  ]


async def widget_chat_endpoint(
  request: WidgetChatRequest
) -> dict[str, str]:
  """
  Widget chat endpoint - PUBLIC (no authentication required).
  
  This endpoint is designed for external widgets embedded in client websites.
  It accepts conversation history for context retention and custom personas
  based on the client_id.
  
  Args:
    request: WidgetChatRequest containing message, client_id, and optional history
    
  Returns:
    JSON response with the AI-generated message
  """
  # Pasamos el historial recibido al orquestador
  response = await get_widget_response(request.message, request.client_id, request.history)
  return {"response": response}


app = create_app()
