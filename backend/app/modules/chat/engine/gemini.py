"""
Gemini Engine Implementation

Implementación concreta del motor de IA usando Google Gemini 2.5 Flash.
Implementa AIEngineProtocol para permitir intercambiabilidad con otros proveedores.

Migrado desde backend/app/services/brain/core.py (NeuralCore)
"""

import os
import asyncio
import json
import re
from typing import List, Dict, Any, Optional, AsyncIterator
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

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
        Genera una respuesta usando Gemini con reintentos automáticos.
        
        Implementa lógica de resiliencia SRE:
        - Reintentos con backoff exponencial para errores 429 (Quota Exceeded)
        - Extracción de retry_delay de la respuesta de Gemini
        - Máximo 3 intentos
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación
            system_instruction: Instrucciones del sistema
            context: Contexto adicional
            **kwargs: Parámetros adicionales (temperature, max_tokens, etc.)
        
        Returns:
            AIResponse: Respuesta estructurada
        
        Raises:
            AIEngineError: Si Gemini falla después de todos los reintentos
        """
        max_retries = 3
        base_delay = 1.0  # Segundos base para backoff exponencial
        
        for attempt in range(max_retries):
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
                        "candidates": len(response.candidates) if hasattr(response, 'candidates') else 1,
                        "retry_attempt": attempt + 1
                    },
                    model=self.MODEL_NAME
                )
            
            except Exception as e:
                # Detectar error 429 (Quota Exceeded)
                is_quota_error = self._is_quota_exceeded_error(e)
                
                if is_quota_error and attempt < max_retries - 1:
                    # Extraer retry_delay de la excepción si está disponible
                    retry_delay = self._extract_retry_delay(e)
                    
                    if retry_delay:
                        # Usar el delay sugerido por Gemini
                        wait_time = retry_delay
                    else:
                        # Backoff exponencial: 1s, 2s, 4s...
                        wait_time = base_delay * (2 ** attempt)
                    
                    # Log del reintento (puede ser mejorado con logging estructurado)
                    print(
                        f"[GeminiEngine] Quota exceeded (attempt {attempt + 1}/{max_retries}). "
                        f"Retrying in {wait_time:.2f}s..."
                    )
                    
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    # Si no es error 429 o ya agotamos los reintentos, lanzar excepción
                    if attempt == max_retries - 1:
                        raise AIEngineError(
                            f"Error generando respuesta con Gemini después de {max_retries} intentos: {str(e)}"
                        )
                    else:
                        raise AIEngineError(f"Error generando respuesta con Gemini: {str(e)}")
        
        # Este punto no debería alcanzarse, pero por seguridad
        raise AIEngineError("Error generando respuesta: se agotaron los reintentos")
    
    def _is_quota_exceeded_error(self, error: Exception) -> bool:
        """
        Detecta si una excepción es un error 429 (Quota Exceeded).
        
        Args:
            error: Excepción a verificar
        
        Returns:
            bool: True si es error 429, False en caso contrario
        """
        error_str = str(error).lower()
        
        # Patrones comunes de errores 429 de Gemini
        quota_patterns = [
            "429",
            "quota exceeded",
            "quota limit",
            "rate limit",
            "too many requests",
            "generativelanguage.googleapis.com/generate_content_free_tier_requests"
        ]
        
        # Verificar si el mensaje contiene alguno de los patrones
        for pattern in quota_patterns:
            if pattern in error_str:
                return True
        
        # Verificar si es una excepción de Google API Core
        if isinstance(error, google_exceptions.ResourceExhausted):
            return True
        
        # Verificar código de estado HTTP si está disponible
        if hasattr(error, 'status_code') and error.status_code == 429:
            return True
        
        return False
    
    def _extract_retry_delay(self, error: Exception) -> Optional[float]:
        """
        Extrae el retry_delay sugerido por Gemini de la excepción.
        
        Gemini suele incluir un retry_delay en segundos en el mensaje de error.
        Ejemplo: "Please retry in 28.361466691s"
        
        Args:
            error: Excepción de Gemini
        
        Returns:
            float: Segundos a esperar antes del siguiente intento, o None si no se puede extraer
        """
        error_str = str(error)
        
        # Buscar patrón "retry in X.XXs" o "retry_delay { seconds: X }"
        patterns = [
            r"retry in ([\d.]+)s",  # "Please retry in 28.36s"
            r"retry_delay.*?seconds[:\s]+(\d+)",  # JSON: "retry_delay": {"seconds": 28}
            r"seconds[:\s]+(\d+)",  # Genérico: "seconds: 28"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, error_str, re.IGNORECASE)
            if match:
                try:
                    delay = float(match.group(1))
                    # Validar que el delay sea razonable (máximo 5 minutos)
                    if 0 < delay <= 300:
                        return delay
                except (ValueError, IndexError):
                    continue
        
        # Intentar parsear JSON si el error contiene JSON
        try:
            # Buscar JSON en el mensaje de error
            json_match = re.search(r'\{.*\}', error_str, re.DOTALL)
            if json_match:
                error_json = json.loads(json_match.group(0))
                
                # Buscar retry_delay en diferentes formatos
                if "retry_delay" in error_json:
                    delay_obj = error_json["retry_delay"]
                    if isinstance(delay_obj, dict) and "seconds" in delay_obj:
                        delay = float(delay_obj["seconds"])
                        if 0 < delay <= 300:
                            return delay
                    elif isinstance(delay_obj, (int, float)):
                        delay = float(delay_obj)
                        if 0 < delay <= 300:
                            return delay
        except (json.JSONDecodeError, KeyError, ValueError):
            pass
        
        return None
    
    async def generate_streaming(
        self,
        prompt: str,
        history: List[Dict[str, str]],
        system_instruction: Optional[str] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        Genera una respuesta en streaming usando Gemini con reintentos automáticos.
        
        Implementa la misma lógica de resiliencia que generate_response.
        
        Args:
            prompt: Mensaje del usuario
            history: Historial de conversación
            system_instruction: Instrucciones del sistema
            **kwargs: Parámetros adicionales
        
        Yields:
            str: Chunks de la respuesta
        
        Raises:
            AIEngineError: Si Gemini falla después de todos los reintentos
        """
        max_retries = 3
        base_delay = 1.0
        
        for attempt in range(max_retries):
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
                
                # Si llegamos aquí, el streaming fue exitoso
                return
            
            except Exception as e:
                # Detectar error 429 (Quota Exceeded)
                is_quota_error = self._is_quota_exceeded_error(e)
                
                if is_quota_error and attempt < max_retries - 1:
                    # Extraer retry_delay de la excepción si está disponible
                    retry_delay = self._extract_retry_delay(e)
                    
                    if retry_delay:
                        wait_time = retry_delay
                    else:
                        wait_time = base_delay * (2 ** attempt)
                    
                    print(
                        f"[GeminiEngine] Quota exceeded en streaming (attempt {attempt + 1}/{max_retries}). "
                        f"Retrying in {wait_time:.2f}s..."
                    )
                    
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    # Si no es error 429 o ya agotamos los reintentos, lanzar excepción
                    if attempt == max_retries - 1:
                        raise AIEngineError(
                            f"Error en streaming con Gemini después de {max_retries} intentos: {str(e)}"
                        )
                    else:
                        raise AIEngineError(f"Error en streaming con Gemini: {str(e)}")
        
        # Este punto no debería alcanzarse
        raise AIEngineError("Error en streaming: se agotaron los reintentos")
    
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

