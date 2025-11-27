"""
Data Mining Schemas - Pydantic Schemas para Request/Response

Define los esquemas Pydantic para validación de requests y responses
del módulo Data Mining.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.modules.data_mining.models import ExtractionStatus


class ExtractionQueryCreate(BaseModel):
    """Request para crear una nueva query de extracción"""
    
    search_topic: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Tema o query de búsqueda para la extracción de datos"
    )
    query_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata adicional de la query (filtros, preferencias, etc.)"
    )


class ExtractionQueryResponse(BaseModel):
    """Response con información de una query de extracción"""
    
    id: int
    user_id: int
    search_topic: str
    status: ExtractionStatus
    results: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    arq_job_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    query_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class LaunchQueryResponse(BaseModel):
    """Response cuando se lanza una query de extracción"""
    
    query_id: int
    status: str = Field(default="queued", description="Estado inicial de la query")
    message: str = Field(..., description="Mensaje descriptivo")
    estimated_completion: Optional[datetime] = Field(
        default=None,
        description="Estimación de tiempo de finalización"
    )


class ExtractionQueryListResponse(BaseModel):
    """Response con lista de queries de extracción"""
    
    queries: list[ExtractionQueryResponse]
    total: int


class ExtractionQueryStatusResponse(BaseModel):
    """Response con el estado del job de Arq para una query"""
    
    query_id: int
    job_id: Optional[str] = None
    job_status: Optional[str] = Field(default=None, description="Estado del job: 'queued', 'in_progress', 'complete', 'failed'")
    query_status: ExtractionStatus = Field(..., description="Estado de la query en la DB")
    progress: Optional[int] = Field(default=None, ge=0, le=100, description="Progreso del job (0-100)")
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ExtractionQueryResultsResponse(BaseModel):
    """Response con los resultados estructurados de una query completada"""
    
    query_id: int
    search_topic: str
    results: Dict[str, Any] = Field(..., description="Resultados estructurados de la extracción (JSONB)")
    completed_at: Optional[datetime] = None
    query_metadata: Optional[Dict[str, Any]] = None

