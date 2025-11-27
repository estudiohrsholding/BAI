"""
OpenTelemetry Instrumentation

Configuración de observabilidad usando OpenTelemetry para tracing distribuido,
métricas y logs estructurados.

Permite visualizar el ciclo de vida completo de una request:
Request → Auth → DB → LLM → Tool Use → Response
"""

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
import os


def setup_telemetry(app=None):
    """
    Configura OpenTelemetry para la aplicación.
    
    Args:
        app: Instancia de FastAPI (opcional, para auto-instrumentación)
    """
    # Crear resource con metadata del servicio
    resource = Resource.create({
        "service.name": "bai-backend",
        "service.version": os.getenv("APP_VERSION", "1.0.0"),
        "deployment.environment": os.getenv("ENVIRONMENT", "development"),
    })
    
    # Configurar TracerProvider
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)
    
    # Exporters según entorno
    if os.getenv("ENVIRONMENT") == "production":
        # En producción, enviar a OTLP collector (Jaeger, Tempo, etc.)
        otlp_exporter = OTLPSpanExporter(
            endpoint=os.getenv("OTLP_ENDPOINT", "http://otel-collector:4317"),
            insecure=True
        )
        provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
    else:
        # En desarrollo, imprimir en consola
        console_exporter = ConsoleSpanExporter()
        provider.add_span_processor(BatchSpanProcessor(console_exporter))
    
    # Auto-instrumentar FastAPI
    if app:
        FastAPIInstrumentor.instrument_app(app)
    
    # Auto-instrumentar SQLAlchemy (SQLModel)
    SQLAlchemyInstrumentor().instrument()
    
    # Auto-instrumentar HTTPX (para llamadas externas)
    HTTPXClientInstrumentor().instrument()
    
    return provider


def get_tracer(name: str):
    """
    Obtiene un tracer para un módulo específico.
    
    Args:
        name: Nombre del módulo (ej: "modules.chat.service")
    
    Returns:
        Tracer: Tracer de OpenTelemetry
    """
    return trace.get_tracer(name)


# Context manager para spans manuales
class TraceContext:
    """
    Context manager para crear spans manuales.
    
    Uso:
        with TraceContext("process_message") as span:
            span.set_attribute("user_id", user_id)
            # ... código ...
    """
    
    def __init__(self, name: str, module: str = "bai"):
        self.tracer = get_tracer(module)
        self.name = name
        self.span = None
    
    def __enter__(self):
        self.span = self.tracer.start_as_current_span(self.name)
        return self.span
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.span:
            self.span.end()

