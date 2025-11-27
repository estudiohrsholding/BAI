"""
AI Engine Interface - Protocolo Abstracto para Motores de IA

Este módulo define la interfaz abstracta que todos los motores de IA deben implementar.
Permite cambiar de proveedor (Gemini, OpenAI, Anthropic) sin modificar la lógica de negocio.

Principio: Dependency Inversion (DIP)
- Alto nivel (ChatService) depende de abstracciones (AIEngineProtocol)
- Bajo nivel (GeminiEngine) implementa la abstracción
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, AsyncIterator, Optional
from dataclasses import dataclass


@dataclass
class AIResponse:
    """Respuesta estructurada del motor de IA"""
    content: str
    metadata: Dict[str, Any]
    tokens_used: Optional[int] = None
    model: Optional[str] = None


class AIEngineProtocol(ABC):
    """
    Protocolo abstracto para motores de IA.
    
    Todas las implementaciones (Gemini, OpenAI, etc.) deben cumplir esta interfaz.
    Esto permite cambiar de proveedor sin modificar el código de negocio.
    """
    
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        history: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> AIResponse:
        """
        Genera una respuesta del motor de IA.
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación (formato: [{"role": "user", "content": "..."}])
            system_instruction: Instrucciones del sistema (persona, comportamiento)
            context: Contexto adicional (inventario, datos del cliente, etc.)
            **kwargs: Parámetros específicos del motor (temperature, max_tokens, etc.)
        
        Returns:
            AIResponse: Respuesta estructurada con contenido y metadata
        
        Raises:
            AIEngineError: Si el motor falla
        """
        pass
    
    @abstractmethod
    async def generate_streaming(
        self,
        prompt: str,
        history: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Genera una respuesta en streaming (token por token).
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación
            system_instruction: Instrucciones del sistema
            **kwargs: Parámetros específicos del motor
        
        Yields:
            str: Tokens de la respuesta (chunks)
        
        Raises:
            AIEngineError: Si el motor falla
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Verifica que el motor de IA esté disponible.
        
        Returns:
            bool: True si el motor está disponible, False en caso contrario
        """
        pass
    
    @property
    @abstractmethod
    def model_name(self) -> str:
        """Nombre del modelo utilizado (ej: 'gemini-2.5-flash', 'gpt-4')"""
        pass
    
    @property
    @abstractmethod
    def provider(self) -> str:
        """Nombre del proveedor (ej: 'google', 'openai', 'anthropic')"""
        pass


class AIEngineError(Exception):
    """Excepción base para errores del motor de IA"""
    pass


class AIEngineTimeoutError(AIEngineError):
    """Excepción cuando el motor de IA excede el timeout"""
    pass


class AIEngineRateLimitError(AIEngineError):
    """Excepción cuando se excede el rate limit del proveedor"""
    pass

