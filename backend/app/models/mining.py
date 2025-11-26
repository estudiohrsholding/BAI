from pydantic import BaseModel
from typing import List, Optional


# Sub-modelos para cada gráfico
class DataPoint(BaseModel):
    """Punto de datos genérico para gráficos (AreaChart, PieChart, BarChart)"""
    name: str
    value: float
    fill: Optional[str] = None  # Color hexadecimal opcional
    color: Optional[str] = None  # Alias para fill (compatibilidad)


class RadarPoint(BaseModel):
    """Punto de datos para RadarChart"""
    subject: str  # Nombre del atributo (ej: "Innovación", "Precio")
    A: int  # Valor del proyecto (0-100)
    B: Optional[int] = None  # Valor de comparación opcional
    fullMark: int = 100  # Valor máximo del radar


class MultiLinePoint(BaseModel):
    """Punto de datos para LineChart multi-línea (tendencias por plataforma)"""
    month: str  # Mes (ej: "Ene", "Feb")
    Instagram: Optional[float] = None
    TikTok: Optional[float] = None
    Twitter: Optional[float] = None
    LinkedIn: Optional[float] = None
    YouTube: Optional[float] = None
    Facebook: Optional[float] = None


class HourlyPoint(BaseModel):
    """Punto de datos para gráfico de actividad por horas"""
    hour: str  # Hora (ej: "00", "12", "18")
    value: float


class KPIs(BaseModel):
    """Indicadores clave de rendimiento"""
    viability: int  # Viabilidad de mercado (0-100)
    viral: float  # Potencial viral (0-10)


class MiningReport(BaseModel):
    """
    Modelo completo del reporte de Data Mining.
    Estructura exacta que necesita el frontend para rellenar los gráficos de Recharts.
    """
    topic: str  # Título del proyecto/idea analizada
    summary: str  # Resumen ejecutivo en texto plano
    
    # KPIs principales
    kpis: KPIs
    
    # Datos para gráficos
    trends: List[DataPoint]  # Para AreaChart (tendencia mensual)
    sentiment: List[DataPoint]  # Para PieChart (sentimiento social)
    demographics: List[DataPoint]  # Para BarChart Horizontal (rangos de edad)
    social: List[DataPoint]  # Para PieChart/BarChart (redes sociales)
    devices: List[DataPoint]  # Para PieChart (dispositivos)
    geo: List[DataPoint]  # Para BarChart Vertical (distribución geográfica)
    radar: List[RadarPoint]  # Para RadarChart (atributos del proyecto)
    multiLine: Optional[List[MultiLinePoint]] = None  # Para LineChart multi-línea
    hourly: Optional[List[HourlyPoint]] = None  # Para LineChart de actividad horaria

