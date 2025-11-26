import os
import json
import google.generativeai as genai
from fastapi.concurrency import run_in_threadpool
from sqlmodel import Session, select
from app.models.chat import ChatMessage
from app.models.mining import MiningReport, DataPoint, RadarPoint, KPIs, MultiLinePoint, HourlyPoint
from app.services.tools.search import search_brave
from app.core.database import engine


async def generate_mining_report(
    session: Session,
    user_id: int,
    topic: str = None
) -> MiningReport:
    """
    Genera un reporte completo de Data Mining usando Gemini y Brave Search API.
    
    Args:
        session: Database session
        user_id: ID del usuario
        topic: Tema/idea de negocio (opcional, se extrae del historial si no se proporciona)
    
    Returns:
        MiningReport con todos los datos estructurados para los gráficos
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY no configurada")

    # 1. Obtener historial de chat reciente para extraer contexto
    statement = (
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.timestamp.desc())
        .limit(20)
    )
    history_messages = session.exec(statement).all()
    history_messages = list(reversed(history_messages))

    # 2. Extraer información del historial si no se proporciona topic
    extracted_topic = topic
    if not extracted_topic and history_messages:
        # Buscar en los últimos mensajes del usuario
        user_messages = [msg.content for msg in history_messages if msg.role == "user"]
        if user_messages:
            extracted_topic = user_messages[-1][:100]  # Primeros 100 caracteres

    extracted_topic = extracted_topic or "Análisis de mercado general"

    # 3. Realizar búsquedas con Brave API (async)
    search_queries = [
        f"{extracted_topic} mercado tendencias",
        f"{extracted_topic} análisis competencia",
        f"{extracted_topic} demografía audiencia",
        f"{extracted_topic} redes sociales presencia",
    ]

    all_search_results = []
    for query in search_queries:
        try:
            results = await search_brave(query, limit=3)
            if results and not results.startswith("Search failed"):
                all_search_results.append(results)
        except Exception as e:
            print(f"Error en búsqueda '{query}': {e}")

    search_context = "\n\n".join(all_search_results[:3])  # Máximo 3 resultados

    def _generate_with_gemini():
        with Session(engine) as thread_session:
            try:
                genai.configure(api_key=api_key)

                # 4. Crear prompt estructurado para Gemini
                system_instruction = """Eres un analista de datos experto especializado en generar reportes de mercado estructurados.
Tu tarea es analizar información de búsquedas web y generar un reporte JSON completo con métricas de mercado.

IMPORTANTE: Debes devolver ÚNICAMENTE un JSON válido que coincida exactamente con esta estructura:

{
  "topic": "Título del proyecto/idea",
  "summary": "Resumen ejecutivo de 2-3 párrafos",
  "kpis": {
    "viability": 85,
    "viral": 7.5
  },
  "trends": [
    {"name": "Ene", "value": 45},
    {"name": "Feb", "value": 52},
    {"name": "Mar", "value": 48},
    {"name": "Abr", "value": 61},
    {"name": "May", "value": 67},
    {"name": "Jun", "value": 78}
  ],
  "sentiment": [
    {"name": "Positivo", "value": 65, "color": "#10b981"},
    {"name": "Neutral", "value": 25, "color": "#8b5cf6"},
    {"name": "Negativo", "value": 10, "color": "#f59e0b"}
  ],
  "demographics": [
    {"name": "18-24", "value": 15},
    {"name": "25-34", "value": 45},
    {"name": "35-44", "value": 25},
    {"name": "45+", "value": 15}
  ],
  "social": [
    {"name": "Instagram", "value": 42, "color": "#E4405F"},
    {"name": "TikTok", "value": 28, "color": "#000000"},
    {"name": "Twitter", "value": 18, "color": "#1DA1F2"},
    {"name": "LinkedIn", "value": 12, "color": "#0077b5"}
  ],
  "devices": [
    {"name": "Mobile", "value": 65, "color": "#8b5cf6"},
    {"name": "Desktop", "value": 30, "color": "#6366f1"},
    {"name": "Tablet", "value": 5, "color": "#a855f7"}
  ],
  "geo": [
    {"name": "España", "value": 40, "color": "#10b981"},
    {"name": "México", "value": 25, "color": "#22c55e"},
    {"name": "Argentina", "value": 20, "color": "#34d399"},
    {"name": "Colombia", "value": 15, "color": "#4ade80"}
  ],
  "radar": [
    {"subject": "Innovación", "A": 85},
    {"subject": "Precio", "A": 70},
    {"subject": "Estética", "A": 75},
    {"subject": "Utilidad", "A": 80},
    {"subject": "Viralidad", "A": 75},
    {"subject": "Riesgo", "A": 35}
  ],
  "multiLine": [
    {"month": "Ene", "Instagram": 40, "TikTok": 25, "YouTube": 35},
    {"month": "Feb", "Instagram": 42, "TikTok": 28, "YouTube": 38},
    {"month": "Mar", "Instagram": 45, "TikTok": 30, "YouTube": 40},
    {"month": "Abr", "Instagram": 48, "TikTok": 32, "YouTube": 42},
    {"month": "May", "Instagram": 50, "TikTok": 35, "YouTube": 45},
    {"month": "Jun", "Instagram": 52, "TikTok": 38, "YouTube": 48}
  ],
  "hourly": [
    {"hour": "00", "value": 8},
    {"hour": "06", "value": 12},
    {"hour": "12", "value": 65},
    {"hour": "18", "value": 80},
    {"hour": "21", "value": 75},
    {"hour": "24", "value": 15}
  ]
}

REGLAS:
- Los valores deben sumar 100% en arrays de porcentajes (sentiment, demographics, social, devices, geo)
- Los KPIs: viability (0-100), viral (0-10)
- Los colores deben ser hexadecimales válidos
- Basa los datos en la información de búsqueda proporcionada
- Si no hay información suficiente, usa valores realistas pero conservadores
- El summary debe ser profesional y en español"""

                prompt = f"""Analiza la siguiente información de búsqueda web sobre: "{extracted_topic}"

INFORMACIÓN DE BÚSQUEDA:
{search_context[:2000] if search_context else "No se encontró información específica. Genera un reporte basado en tendencias generales del mercado."}

Genera un reporte JSON completo con métricas de mercado realistas basadas en esta información.
Asegúrate de que todos los porcentajes sumen 100 y que los datos sean coherentes entre sí."""

                # 5. Generar respuesta con Gemini
                model = genai.GenerativeModel(
                    "gemini-2.5-flash",
                    system_instruction=system_instruction
                )

                response = model.generate_content(prompt)

                # 6. Extraer JSON de la respuesta
                response_text = response.text.strip()

                # Intentar extraer JSON si está envuelto en markdown
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()
                elif "```" in response_text:
                    json_start = response_text.find("```") + 3
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()

                # 7. Parsear JSON y validar con Pydantic
                try:
                    report_dict = json.loads(response_text)
                    report = MiningReport(**report_dict)
                    return report
                except json.JSONDecodeError as e:
                    print(f"Error parseando JSON: {e}")
                    print(f"Respuesta recibida: {response_text[:500]}")
                    # Fallback: generar reporte por defecto
                    return _generate_fallback_report(extracted_topic)
                except Exception as e:
                    print(f"Error validando reporte: {e}")
                    return _generate_fallback_report(extracted_topic)

            except Exception as e:
                print(f"Error generando reporte: {e}")
                return _generate_fallback_report(topic or "Análisis General")

    return await run_in_threadpool(_generate_with_gemini)


def _generate_fallback_report(topic: str) -> MiningReport:
    """Genera un reporte por defecto si falla la generación con IA"""
    return MiningReport(
        topic=topic,
        summary=f"Análisis de mercado para {topic}. Datos generados basados en tendencias generales del sector.",
        kpis=KPIs(viability=75, viral=7.0),
        trends=[
            DataPoint(name="Ene", value=40),
            DataPoint(name="Feb", value=45),
            DataPoint(name="Mar", value=50),
            DataPoint(name="Abr", value=55),
            DataPoint(name="May", value=60),
            DataPoint(name="Jun", value=65),
        ],
        sentiment=[
            DataPoint(name="Positivo", value=60, color="#10b981"),
            DataPoint(name="Neutral", value=30, color="#8b5cf6"),
            DataPoint(name="Negativo", value=10, color="#f59e0b"),
        ],
        demographics=[
            DataPoint(name="18-24", value=20),
            DataPoint(name="25-34", value=40),
            DataPoint(name="35-44", value=25),
            DataPoint(name="45+", value=15),
        ],
        social=[
            DataPoint(name="Instagram", value=35, color="#E4405F"),
            DataPoint(name="Twitter", value=25, color="#1DA1F2"),
            DataPoint(name="TikTok", value=25, color="#000000"),
            DataPoint(name="LinkedIn", value=15, color="#0077b5"),
        ],
        devices=[
            DataPoint(name="Mobile", value=65, color="#8b5cf6"),
            DataPoint(name="Desktop", value=30, color="#6366f1"),
            DataPoint(name="Tablet", value=5, color="#a855f7"),
        ],
        geo=[
            DataPoint(name="España", value=40, color="#10b981"),
            DataPoint(name="México", value=25, color="#22c55e"),
            DataPoint(name="Argentina", value=20, color="#34d399"),
            DataPoint(name="Colombia", value=15, color="#4ade80"),
        ],
        radar=[
            RadarPoint(subject="Innovación", A=75),
            RadarPoint(subject="Precio", A=70),
            RadarPoint(subject="Estética", A=70),
            RadarPoint(subject="Utilidad", A=75),
            RadarPoint(subject="Viralidad", A=70),
            RadarPoint(subject="Riesgo", A=40),
        ],
        multiLine=[
            MultiLinePoint(month="Ene", Instagram=35, TikTok=25, YouTube=30),
            MultiLinePoint(month="Feb", Instagram=37, TikTok=27, YouTube=32),
            MultiLinePoint(month="Mar", Instagram=40, TikTok=30, YouTube=35),
            MultiLinePoint(month="Abr", Instagram=42, TikTok=32, YouTube=37),
            MultiLinePoint(month="May", Instagram=45, TikTok=35, YouTube=40),
            MultiLinePoint(month="Jun", Instagram=48, TikTok=38, YouTube=42),
        ],
        hourly=[
            HourlyPoint(hour="00", value=10),
            HourlyPoint(hour="06", value=15),
            HourlyPoint(hour="12", value=60),
            HourlyPoint(hour="18", value=75),
            HourlyPoint(hour="21", value=70),
            HourlyPoint(hour="24", value=12),
        ],
    )

