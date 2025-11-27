"""
Gemini Engine Implementation

Implementación concreta del motor de IA usando Google Gemini 2.5 Flash.
Implementa AIEngineProtocol para permitir intercambiabilidad con otros proveedores.

Migrado desde backend/app/services/brain/core.py (NeuralCore)
"""

import os
from typing import List, Dict, Any, Optional, AsyncIterator
import google.generativeai as genai

from app.modules.chat.engine.interface import (
    AIEngineProtocol,
    AIResponse,
    AIEngineError,
    AIEngineTimeoutError
)


class GeminiEngine(AIEngineProtocol):
    """
    Implementación del motor de IA usando Google Gemini 2.5 Flash.
    
    Esta clase encapsula toda la lógica específica de Gemini, permitiendo
    que el resto del código sea agnóstico al proveedor.
    """
    
    MODEL_NAME = "gemini-2.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializa el motor Gemini.
        
        Args:
            api_key: API key de Google (si no se proporciona, usa env var)
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY no encontrada en variables de entorno")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.MODEL_NAME)
    
    async def generate_response(
        self,
        prompt: str,
        history: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> AIResponse:
        """
        Genera una respuesta usando Gemini.
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación
            system_instruction: Instrucciones del sistema
            context: Contexto adicional
            **kwargs: Parámetros adicionales (temperature, max_tokens, etc.)
        
        Returns:
            AIResponse: Respuesta estructurada
        
        Raises:
            AIEngineError: Si Gemini falla
        """
        try:
            # Construir prompt completo
            full_prompt = self._build_prompt(
                prompt=prompt,
                history=history,
                system_instruction=system_instruction,
                context=context
            )
            
            # Configuración de generación
            generation_config = {
                "temperature": kwargs.get("temperature", 0.7),
                "max_output_tokens": kwargs.get("max_tokens", 2048),
            }
            
            # Generar respuesta
            response = self.model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            # Extraer texto de la respuesta
            response_text = response.text if hasattr(response, 'text') else str(response)
            
            return AIResponse(
                content=response_text,
                metadata={
                    "model": self.MODEL_NAME,
                    "provider": "google",
                    "candidates": len(response.candidates) if hasattr(response, 'candidates') else 1
                },
                model=self.MODEL_NAME
            )
        
        except Exception as e:
            raise AIEngineError(f"Error generando respuesta con Gemini: {str(e)}")
    
    async def generate_streaming(
        self,
        prompt: str,
        history: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Genera una respuesta en streaming usando Gemini.
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación
            system_instruction: Instrucciones del sistema
            **kwargs: Parámetros adicionales
        
        Yields:
            str: Chunks de la respuesta
        """
        try:
            full_prompt = self._build_prompt(
                prompt=prompt,
                history=history,
                system_instruction=system_instruction
            )
            
            # Generar respuesta en streaming
            response = self.model.generate_content(
                full_prompt,
                stream=True,
                generation_config={
                    "temperature": kwargs.get("temperature", 0.7),
                }
            )
            
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        
        except Exception as e:
            raise AIEngineError(f"Error en streaming con Gemini: {str(e)}")
    
    async def health_check(self) -> bool:
        """
        Verifica que Gemini esté disponible.
        
        Returns:
            bool: True si Gemini responde, False en caso contrario
        """
        try:
            # Test simple
            test_response = self.model.generate_content("test")
            return test_response is not None
        except Exception:
            return False
    
    @property
    def model_name(self) -> str:
        """Nombre del modelo"""
        return self.MODEL_NAME
    
    @property
    def provider(self) -> str:
        """Nombre del proveedor"""
        return "google"
    
    def _build_prompt(
        self,
        prompt: str,
        history: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Construye el prompt completo para Gemini.
        
        Usa el mismo formato que NeuralCore para mantener compatibilidad:
        - Construye un "super prompt" concatenado para mejor retención de contexto
        - Formatea el historial como texto plano (más robusto para modelos Flash)
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación (formato: [{"role": "user", "content": "..."}])
            system_instruction: Instrucciones del sistema
            context: Contexto adicional
        
        Returns:
            str: Prompt completo formateado
        """
        # Construir contexto de conversación manualmente como texto plano
        # Esto asegura que Gemini Flash lea TODO el historial, no solo mensajes recientes
        conversation_context = f"SYSTEM INSTRUCTION:\n{system_instruction}\n\nCONVERSATION HISTORY:\n"
        
        # Convertir historial a formato de texto plano
        for msg in history:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            
            # Extraer content de 'parts' array si está presente (formato legacy)
            parts = msg.get('parts', [])
            if parts:
                content = parts[0] if isinstance(parts, list) and len(parts) > 0 else str(parts)
            
            role_label = "[User]" if role == 'user' else "[AI]"
            conversation_context += f"{role_label}: {content}\n"
        
        # Añadir mensaje actual
        current_message = prompt
        final_prompt = f"{conversation_context}\n[User]: {current_message}\n[AI]:"
        
        return final_prompt

