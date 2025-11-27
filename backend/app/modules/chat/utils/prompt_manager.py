"""
Prompt Manager - Gestión de Prompts y Personas

Migrado desde backend/app/services/brain/prompts.py
Gestiona los system prompts y personas para diferentes contextos.
Separa la lógica de prompts de la lógica de negocio.
"""

import json
import os
from pathlib import Path
from typing import Dict, Optional, List


class PromptManager:
    """
    Gestiona system prompts para diferentes personas y contextos.
    
    Migrado desde services/brain/prompts.py para encapsular toda la lógica
    de prompts dentro del módulo chat.
    """
    
    @classmethod
    def _load_inventory(cls, client_id: str) -> str:
        """
        Carga el inventario desde un archivo JSON dinámicamente.
        
        Busca el archivo en app/data/inventories/{client_id}.json
        y lo convierte a un string formateado legible para la IA.
        
        Formato flexible: Soporta diferentes tipos de inventarios:
        - Inmobiliarias: ref, titulo, zona, precio, habitaciones, detalles
        - Software/Planes: ref, titulo, precio, detalles
        - Cualquier otro formato con campos comunes
        
        Manejo robusto de errores: Si el archivo no existe o falla,
        devuelve un mensaje genérico sin romper el servidor.
        
        Args:
            client_id: ID del cliente (ej: 'inmo-test-001', 'cannabiapp-web-001')
            
        Returns:
            String formateado con el inventario para el prompt.
            Si no existe o falla, devuelve mensaje genérico sin romper el servidor.
        """
        # Construir ruta absoluta de forma segura dentro de Docker
        # Path(__file__) = backend/app/modules/chat/utils/prompt_manager.py
        # .parent = backend/app/modules/chat/utils/
        # .parent = backend/app/modules/chat/
        # .parent = backend/app/modules/
        # .parent = backend/app/
        # / "data" / "inventories" = backend/app/data/inventories/
        inventory_path = Path(__file__).parent.parent.parent.parent / "data" / "inventories"
        inventory_file = inventory_path / f"{client_id}.json"
        
        try:
            # Verificar si el archivo existe
            if not inventory_file.exists():
                # Inventario no disponible - no rompe el servidor, solo informa
                return "INVENTARIO: No disponible en este momento."
            
            # Leer y parsear JSON
            with open(inventory_file, 'r', encoding='utf-8') as f:
                items = json.load(f)
            
            # Validar que hay items
            if not items or not isinstance(items, list) or len(items) == 0:
                return "INVENTARIO: No hay items disponibles en este momento."
            
            # Formatear el inventario como texto legible para la IA
            inventory_lines = ["INVENTARIO DISPONIBLE (Solo ofrece esto):\n"]
            
            for item in items:
                ref = item.get('ref', 'N/A')
                titulo = item.get('titulo', 'Sin título')
                precio = item.get('precio', 0)
                detalles = item.get('detalles', '')
                
                # Formato flexible según campos disponibles
                # Para inmobiliarias: incluye zona y habitaciones
                # Para software/planes: solo ref, titulo, precio, detalles
                parts = [f"{ref}: {titulo}"]
                
                # Añadir zona si existe (inmobiliarias)
                if 'zona' in item and item.get('zona'):
                    parts.append(f"Zona: {item['zona']}")
                
                # Añadir precio si existe
                if precio and precio > 0:
                    parts.append(f"Precio: {precio:,}€")
                elif precio == 0 and 'precio' in item:
                    parts.append("Precio: Consultar")
                
                # Añadir habitaciones si existe (inmobiliarias)
                if 'habitaciones' in item and item.get('habitaciones', 0) > 0:
                    parts.append(f"{item['habitaciones']} Habitación(es)")
                
                # Añadir detalles si existen
                if detalles:
                    parts.append(detalles)
                
                line = "- " + ". ".join(parts)
                inventory_lines.append(line)
            
            return "\n".join(inventory_lines)
            
        except json.JSONDecodeError as e:
            # Error al parsear JSON - log pero no rompe el servidor
            print(f"Warning: Error parsing inventory JSON for {client_id}: {str(e)}")
            return "INVENTARIO: Error al leer datos."
        except IOError as e:
            # Error al leer archivo - log pero no rompe el servidor
            print(f"Warning: Error reading inventory file for {client_id}: {str(e)}")
            return "INVENTARIO: Error al cargar archivo."
        except Exception as e:
            # Cualquier otro error - log pero no rompe el servidor
            print(f"Warning: Unexpected error loading inventory for {client_id}: {str(e)}")
            return "INVENTARIO: Error inesperado."
    
    # Base B.A.I. persona
    BAI_BASE_PROMPT = (
        "Eres B.A.I. (Business Artificial Intelligence), un socio estratégico de negocios. "
        "Tu personalidad es amigable, empática y altamente técnica. Piensa en ti mismo como 'El Sabio Amigable': "
        "sabio, accesible y genuinamente interesado en el éxito de los demás. "
        "Ayudas al usuario con Automatización (Servicio 1), Software (Servicio 2) y Minería de Datos (Servicio 3). "
        "Tus respuestas deben ser concisas, profesionales pero cálidas. Nunca seas robótico; sé conversacional y humano.\n\n"
        "IDIOMA PRINCIPAL: ESPAÑOL. Responde siempre en español a menos que el usuario te hable explícitamente en otro idioma."
    )
    
    # Automation protocol (reusable)
    AUTOMATION_PROTOCOL = (
        "\n\n"
        "PROTOCOLO: CONSULTA DE AUTOMATIZACIÓN\n"
        "Cuando un usuario diga 'Quiero automatizar mi negocio', 'Inicia el análisis' o pida un análisis de automatización:\n\n"
        "Paso 1: Reconoce su entusiasmo con calidez. Expresa un interés genuino en ayudarles a optimizar su negocio.\n\n"
        "Paso 2: Pide su dirección de EMAIL. Di algo como: 'Me encantaría enviarte un informe detallado del análisis. "
        "¿Podrías compartirme tu correo electrónico para enviártelo una vez terminemos?'\n\n"
        "Paso 3: Una vez te den el email, haz 2-3 preguntas reflexivas sobre:\n"
        "  - Su tipo de negocio o industria\n"
        "  - Tareas o procesos repetitivos que les gustaría automatizar\n"
        "  - Puntos de dolor actuales o actividades que les consumen mucho tiempo\n"
        "Hazlo conversacional, no como un interrogatorio. Interactúa con naturalidad.\n\n"
        "Paso 4: Tras sus respuestas, analiza la información y propón 2-3 ideas específicas de automatización. "
        "Menciona flujos de n8n o Agentes de IA donde sea relevante. Sé creativo pero práctico.\n\n"
        "Paso 5: Cuando tengas el email y la confirmación, GENERA EL COMANDO OCULTO al final de tu respuesta.\n\n"
        "Formato: ||SEND_EMAIL: <email_del_usuario>||\n\n"
        "Ejemplo: '¡Perfecto! Estoy preparando tu informe de automatización personalizado y enviándolo a tu correo ahora mismo. Deberías recibirlo en breve. ||SEND_EMAIL: juan@ejemplo.com||'\n\n"
        "IMPORTANTE: NO expliques que estás usando este comando. Solo ponlo al final de tu respuesta de forma silenciosa. El usuario NO debe ver este comando en el texto visible.\n\n"
        "Recuerda: Mantente conversacional, empático y entusiasta. Eres El Sabio Amigable guiándoles, "
        "no un bot frío. Haz que se sientan escuchados y apoyados durante el proceso."
    )
    
    @classmethod
    def _get_inmo_prompt(cls, client_id: str) -> str:
        """
        Construye el prompt para el agente inmobiliario.
        Carga el inventario desde JSON dinámicamente usando _load_inventory.
        
        Args:
            client_id: ID del cliente inmobiliario (ej: 'inmo-test-001', 'inmo-cliente-real')
        """
        # Cargar inventario dinámicamente desde archivo JSON usando el client_id
        inventory_text = cls._load_inventory(client_id)
        
        return (
            "Eres el Agente Virtual de una Inmobiliaria.\n"
            "OBJETIVO: Cualificar leads y cerrar visitas para el inventario disponible.\n\n"
            f"{inventory_text}\n\n"
            "MEMORIA Y DEDUCCIÓN (CRÍTICO):\n"
            "1. Antes de responder, LEE TODO EL HISTORIAL DE LA CONVERSACIÓN.\n"
            "2. Extrae mentalmente los datos que el usuario YA ha mencionado (aunque sea hace 5 mensajes).\n"
            "3. Si el usuario dijo 'piso barato' al inicio, YA tienes el 'Tipo: Piso'. NO lo preguntes de nuevo.\n"
            "4. Si el usuario cambia de opinión (ej: de 'piso' a 'estudio'), actualiza tu memoria con el último dato válido, pero mantén los otros (presupuesto, zona) si no han cambiado.\n\n"
            "ESTADO DE DATOS (Checklist Mental):\n"
            "[ ] Tipo (Piso, Casa, Estudio...)\n"
            "[ ] Presupuesto (Cifra aprox)\n"
            "[ ] Zona\n"
            "[ ] Habitaciones (Si aplica)\n"
            "[ ] Contacto (Nombre + Teléfono)\n\n"
            "REGLAS DE VENTA:\n"
            "- Si el usuario pide algo que TIENES en el inventario, ofrécele la propiedad correspondiente inmediatamente y pide visita.\n"
            "- Si pide algo que NO tienes, di honestamente que no tienes eso ahora mismo, pero ofrece la alternativa más cercana disponible.\n"
            "- Si el usuario pregunta '¿Tienes algo barato?', ofrécele las opciones más económicas del inventario según su presupuesto.\n"
            "- Tu meta es conseguir: Nombre y Teléfono para agendar visita a una propiedad concreta del inventario.\n"
            "- Si tienes Nombre y Teléfono + 2 datos clave (ej: Zona y Presupuesto), CIERRA LA VENTA. Di: 'Perfecto [Nombre], con estos datos busco las mejores opciones y te llamo al [Teléfono] hoy mismo. ¡Gracias!'.\n"
            "- Jamás preguntes algo que ya está en el historial.\n"
            "- Sé breve y comercial."
        )
    
    @classmethod
    def _get_cannabiapp_prompt(cls, client_id: str) -> str:
        """
        Construye el prompt para el asistente de ventas de Cannabiapp.
        Carga el inventario (planes y licencias) desde JSON dinámicamente.
        
        Args:
            client_id: ID del cliente Cannabiapp (ej: 'cannabiapp-web-001')
        """
        # Cargar inventario dinámicamente desde archivo JSON usando el client_id
        inventory_text = cls._load_inventory(client_id)
        
        return (
            "Eres el Asistente de Ventas de 'Cannabiapp', el software líder para Clubes Sociales de Cannabis (CSC).\n"
            "OBJETIVO: Resolver dudas técnicas y cerrar demos o ventas de licencias.\n\n"
            f"{inventory_text}\n\n"
            "COMPORTAMIENTO:\n"
            "- Eres experto en legalidad de CSCs y gestión eficiente.\n"
            "- Si preguntan precios, ofrece los planes del inventario.\n"
            "- Tu objetivo final es conseguir el email del presidente del club para enviarle una demo.\n"
            "- Idioma: Español. Tono: Profesional pero relajado.\n"
            "- Sé conversacional y empático. Entiende las necesidades específicas de cada club.\n"
            "- Si preguntan sobre funcionalidades, explica cómo Cannabiapp ayuda con: gestión de socios, control de acceso, dispensario (TPV), stock y contabilidad.\n"
            "- Si preguntan sobre hardware, menciona que los lectores de huella y tarjetas NFC están disponibles bajo pedido.\n"
            "- Cuando tengas el email del presidente, CIERRA LA VENTA. Di: 'Perfecto, te envío una demo personalizada a tu correo. ¡Gracias por confiar en Cannabiapp!'.\n"
        )
    
    @classmethod
    def get_widget_prompt(cls, client_id: str) -> str:
        """
        Get system prompt for a specific widget client.
        
        Lógica generalizada Multi-Tenencia:
        - Si client_id empieza con 'inmo-', usa el prompt inmobiliario
        - Si client_id empieza con 'cannabiapp-', usa el prompt de ventas de Cannabiapp
        - Carga el inventario correspondiente desde {client_id}.json dinámicamente
        
        Esto permite dar de alta nuevos clientes solo creando su JSON,
        sin tocar código Python cada vez.
        
        Args:
            client_id: The client identifier (e.g., 'inmo-test-001', 'cannabiapp-web-001')
            
        Returns:
            System prompt for the widget, or generic B.A.I. prompt if not found
        """
        # Lógica generalizada: Detectar tipo de cliente por prefijo
        if client_id and client_id.startswith("inmo-"):
            return cls._get_inmo_prompt(client_id)
        
        if client_id and client_id.startswith("cannabiapp-"):
            return cls._get_cannabiapp_prompt(client_id)
        
        # Generic widget prompt para otros tipos de clientes
        return (
            "Eres B.A.I. (Business Artificial Intelligence), un asistente virtual amigable y profesional. "
            "Tu objetivo es ayudar al usuario de forma clara y concisa. "
            "Sé empático, conversacional y útil. "
            "Responde siempre en español a menos que el usuario te hable en otro idioma.\n\n"
            "Mantén las respuestas breves y al grano (2-3 frases máximo). "
            "Si no sabes algo, admítelo con honestidad y ofrece alternativas."
        )
    
    @classmethod
    def get_bai_prompt(cls, include_automation_protocol: bool = True) -> str:
        """
        Get the full B.A.I. system prompt.
        
        Args:
            include_automation_protocol: Whether to include the automation protocol
            
        Returns:
            Complete system prompt for B.A.I.
        """
        prompt = cls.BAI_BASE_PROMPT
        if include_automation_protocol:
            prompt += cls.AUTOMATION_PROTOCOL
        return prompt
    
    @classmethod
    def get_system_prompt(cls, client_id: Optional[str] = None) -> str:
        """
        Get system prompt for a widget client.
        
        Lógica Multi-Tenencia:
        - Si client_id empieza con 'inmo-', detecta automáticamente que es un cliente inmobiliario
        - Carga su inventario desde {client_id}.json dinámicamente
        - Inyecta el inventario en el prompt inmobiliario genérico
        - Si el archivo no existe, el servidor sigue funcionando (manejo robusto de errores)
        
        Esto permite añadir nuevos clientes inmobiliarios solo creando su JSON,
        sin tocar código Python cada vez.
        
        Args:
            client_id: The client identifier (e.g., 'inmo-test-001', 'inmo-cliente-002', 'inmo-pepe')
            
        Returns:
            System prompt for the widget, or generic B.A.I. prompt if not found
        """
        if client_id is None:
            return cls.BAI_BASE_PROMPT
        
        # Use get_widget_prompt which now handles multi-tenant logic dynamically
        # Detecta automáticamente clientes inmobiliarios por prefijo 'inmo-'
        return cls.get_widget_prompt(client_id)

