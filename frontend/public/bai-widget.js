/**
 * B.A.I. Chat Widget - Widget Embebible Universal
 * 
 * Este script puede ser insertado en cualquier sitio web.
 * No requiere dependencias externas (Vanilla JS puro).
 * 
 * Uso:
 * <script src="https://tu-dominio.com/bai-widget.js" data-client-id="CLIENT_ID"></script>
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  
  // Obtener el script actual para leer data-client-id
  const currentScript = document.currentScript || 
    document.querySelector('script[src*="bai-widget.js"]');
  
  const CLIENT_ID = currentScript?.getAttribute('data-client-id') || 'default';
  // Detectar si estamos en desarrollo o producción
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = isDevelopment 
    ? 'http://localhost:8000/api/v1/widget/chat'  // Desarrollo
    : 'https://baibussines.com/api/v1/widget/chat'; // Producción
  
  // ============================================
  // ESTILOS CSS (Inyectados dinámicamente)
  // ============================================
  
  const widgetStyles = `
    /* Contenedor del Widget */
    #bai-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Botón Flotante */
    #bai-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
    }
    
    #bai-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
    }
    
    #bai-widget-button:active {
      transform: scale(0.95);
    }
    
    #bai-widget-button svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    /* Badge de notificación (opcional) */
    #bai-widget-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      color: white;
      border: 2px solid white;
    }
    
    /* Ventana de Chat */
    #bai-widget-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    #bai-widget-window.open {
      display: flex;
    }
    
    /* Header */
    #bai-widget-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
    }
    
    #bai-widget-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    #bai-widget-logo {
      font-weight: bold;
      font-size: 18px;
      letter-spacing: 0.5px;
    }
    
    #bai-widget-status {
      font-size: 12px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    #bai-widget-status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    #bai-widget-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    #bai-widget-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    #bai-widget-close svg {
      width: 18px;
      height: 18px;
      color: white;
    }
    
    /* Área de Mensajes */
    #bai-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    #bai-widget-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    #bai-widget-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    
    #bai-widget-messages::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    
    .bai-message {
      display: flex;
      gap: 8px;
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .bai-message.user {
      justify-content: flex-end;
    }
    
    .bai-message.bot {
      justify-content: flex-start;
    }
    
    .bai-message-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    
    .bai-message.user .bai-message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .bai-message.bot .bai-message-bubble {
      background: white;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .bai-message-time {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 4px;
      text-align: right;
    }
    
    .bai-message.bot .bai-message-time {
      text-align: left;
    }
    
    /* Input Area */
    #bai-widget-input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    
    #bai-widget-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    #bai-widget-input:focus {
      border-color: #667eea;
    }
    
    #bai-widget-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    
    #bai-widget-send:hover {
      transform: scale(1.1);
    }
    
    #bai-widget-send:active {
      transform: scale(0.95);
    }
    
    #bai-widget-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    #bai-widget-send svg {
      width: 18px;
      height: 18px;
      color: white;
    }
    
    /* Typing Indicator */
    .bai-typing-indicator {
      display: flex;
      gap: 4px;
      padding: 10px 14px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }
    
    .bai-typing-dot {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }
    
    .bai-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .bai-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      #bai-widget-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 80px;
        right: 20px;
        left: 20px;
      }
    }
  `;

  // ============================================
  // FUNCIONES UTILITARIAS
  // ============================================
  
  function injectStyles() {
    if (document.getElementById('bai-widget-styles')) {
      return; // Ya están inyectados
    }
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'bai-widget-styles';
    styleSheet.textContent = widgetStyles;
    document.head.appendChild(styleSheet);
  }
  
  function formatTime(date = new Date()) {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  // ============================================
  // CLASE PRINCIPAL DEL WIDGET
  // ============================================
  
  class BaiWidget {
    constructor(clientId) {
      this.clientId = clientId;
      this.isOpen = false;
      this.messages = [];
      this.init();
    }
    
    init() {
      // Inyectar estilos
      injectStyles();
      
      // Crear HTML
      this.createWidget();
      
      // Event listeners
      this.attachEvents();
      
      // Mensaje de bienvenida
      this.addWelcomeMessage();
    }
    
    createWidget() {
      // Contenedor principal
      const container = document.createElement('div');
      container.id = 'bai-widget-container';
      
      // Botón flotante
      const button = document.createElement('button');
      button.id = 'bai-widget-button';
      button.setAttribute('aria-label', 'Abrir chat B.A.I.');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span id="bai-widget-badge"></span>
      `;
      
      // Ventana de chat
      const window = document.createElement('div');
      window.id = 'bai-widget-window';
      window.innerHTML = `
        <!-- Header -->
        <div id="bai-widget-header">
          <div id="bai-widget-header-left">
            <div id="bai-widget-logo">B.A.I.</div>
            <div id="bai-widget-status">
              <span id="bai-widget-status-dot"></span>
              <span>En línea</span>
            </div>
          </div>
          <button id="bai-widget-close" aria-label="Cerrar chat">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Área de mensajes -->
        <div id="bai-widget-messages"></div>
        
        <!-- Input area -->
        <div id="bai-widget-input-area">
          <input 
            type="text" 
            id="bai-widget-input" 
            placeholder="Escribe tu mensaje..."
            autocomplete="off"
          />
          <button id="bai-widget-send" aria-label="Enviar mensaje">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      `;
      
      container.appendChild(button);
      container.appendChild(window);
      document.body.appendChild(container);
      
      // Guardar referencias
      this.button = button;
      this.window = window;
      this.messagesContainer = window.querySelector('#bai-widget-messages');
      this.input = window.querySelector('#bai-widget-input');
      this.sendButton = window.querySelector('#bai-widget-send');
    }
    
    attachEvents() {
      // Toggle ventana
      this.button.addEventListener('click', () => {
        this.toggle();
      });
      
      // Cerrar ventana
      const closeButton = this.window.querySelector('#bai-widget-close');
      closeButton.addEventListener('click', () => {
        this.close();
      });
      
      // Enviar mensaje (Enter o botón)
      this.sendButton.addEventListener('click', () => {
        this.sendMessage();
      });
      
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Cerrar al hacer clic fuera (opcional)
      document.addEventListener('click', (e) => {
        if (this.isOpen && 
            !this.window.contains(e.target) && 
            !this.button.contains(e.target)) {
          // No cerrar automáticamente (mejor UX)
        }
      });
    }
    
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
    
    open() {
      this.isOpen = true;
      this.window.classList.add('open');
      this.input.focus();
    }
    
    close() {
      this.isOpen = false;
      this.window.classList.remove('open');
    }
    
    addWelcomeMessage() {
      const welcomeText = '¡Hola! Soy B.A.I., tu asistente virtual. ¿En qué puedo ayudarte?';
      this.addMessage('bot', welcomeText);
    }
    
    addMessage(role, text) {
      const message = {
        role,
        text,
        time: formatTime()
      };
      
      this.messages.push(message);
      this.renderMessage(message);
    }
    
    renderMessage(message) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `bai-message ${message.role}`;
      
      messageDiv.innerHTML = `
        <div class="bai-message-bubble">
          ${this.escapeHtml(message.text)}
          <div class="bai-message-time">${message.time}</div>
        </div>
      `;
      
      this.messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();
    }
    
    showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'bai-message bot';
      typingDiv.id = 'bai-typing-indicator';
      typingDiv.innerHTML = `
        <div class="bai-typing-indicator">
          <div class="bai-typing-dot"></div>
          <div class="bai-typing-dot"></div>
          <div class="bai-typing-dot"></div>
        </div>
      `;
      
      this.messagesContainer.appendChild(typingDiv);
      this.scrollToBottom();
    }
    
    hideTypingIndicator() {
      const indicator = document.getElementById('bai-typing-indicator');
      if (indicator) {
        indicator.remove();
      }
    }
    
    async sendMessage() {
      const text = this.input.value.trim();
      
      if (!text) {
        return;
      }
      
      // Limpiar input
      this.input.value = '';
      this.sendButton.disabled = true;
      
      // Mostrar mensaje del usuario
      this.addMessage('user', text);
      
      // Mostrar indicador de escritura
      this.showTypingIndicator();
      
      // Llamada real a la API
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            client_id: this.clientId
          })
        });
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ocultar indicador de escritura
        this.hideTypingIndicator();
        
        // Mostrar respuesta del bot
        const botResponse = data.response || 'Lo siento, no pude procesar tu mensaje.';
        this.addMessage('bot', botResponse);
        
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        
        // Ocultar indicador de escritura
        this.hideTypingIndicator();
        
        // Mostrar mensaje de error amigable
        let errorMessage = 'Lo siento, no puedo conectar ahora. Por favor, intenta de nuevo en un momento.';
        
        // Mensaje más específico si es un error de red
        if (error.message && error.message.includes('Failed to fetch')) {
          errorMessage = 'Lo siento, no puedo conectar con el servidor. Por favor, verifica tu conexión e intenta de nuevo.';
        }
        
        this.addMessage('bot', errorMessage);
      } finally {
        // Rehabilitar botón y enfocar input
        this.sendButton.disabled = false;
        this.input.focus();
      }
    }
    
    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
  
  function initWidget() {
    // Evitar múltiples instancias
    if (window.baiWidget) {
      return;
    }
    
    // Crear instancia del widget
    window.baiWidget = new BaiWidget(CLIENT_ID);
    
    // Exponer API pública (opcional)
    window.BAI = {
      open: () => window.baiWidget.open(),
      close: () => window.baiWidget.close(),
      toggle: () => window.baiWidget.toggle(),
      sendMessage: (text) => {
        window.baiWidget.input.value = text;
        window.baiWidget.sendMessage();
      }
    };
  }
  
})();

