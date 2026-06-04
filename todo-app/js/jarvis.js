/**
 * JARVIS - Interfaz principal de control
 */

class Jarvis {
    constructor() {
        // DOM Elements
        this.inputUsuario = document.getElementById('userInput');
        this.botonEnviar = document.getElementById('sendBtn');
        this.botonVoz = document.getElementById('voiceBtn');
        this.areaChat = document.getElementById('chatMessages');
        this.panelDesempenio = document.getElementById('performancePanel');
        this.panelConfianza = document.getElementById('confidencePanel');
        this.panelTiempo = document.getElementById('timePanel');
        this.hintsTag = document.querySelectorAll('.hint-tag');
        
        // Brain IA
        this.brain = new JarvisBrain();
        
        // Inicializar
        this.inicializar();
    }

    inicializar() {
        this.adjuntarEventos();
        this.mostrarMensajeBienvenida();
        this.configurarReconocimientoVoz();
    }

    adjuntarEventos() {
        // Enviar mensaje
        this.botonEnviar.addEventListener('click', () => this.enviarMensaje());
        this.inputUsuario.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.enviarMensaje();
        });

        // Hints
        this.hintsTag.forEach(hint => {
            hint.addEventListener('click', () => {
                this.inputUsuario.value = hint.textContent;
                this.inputUsuario.focus();
            });
        });

        // Voz
        this.botonVoz.addEventListener('click', () => this.iniciarReconocimientoVoz());
    }

    /**
     * Mensaje de bienvenida
     */
    mostrarMensajeBienvenida() {
        const bienvenida = `¡Bienvenido! Soy JARVIS, tu asistente IA inteligente.
        
Puedo ayudarte con:
• Preguntas y búsqueda de información
• Consultas sobre clima y noticias
• Cálculos matemáticos
• Y mucho más

¿En qué puedo ayudarte?`;
        
        this.mostrarMensajeBot(bienvenida, 100);
    }

    /**
     * Envía el mensaje del usuario
     */
    async enviarMensaje() {
        const entrada = this.inputUsuario.value.trim();
        
        if (!entrada) return;
        
        // Mostrar mensaje del usuario
        this.mostrarMensajeUsuario(entrada);
        
        // Limpiar input
        this.inputUsuario.value = '';
        
        // Mostrar indicador de procesamiento
        this.mostrarProcesando();
        
        // Procesar con JARVIS
        const resultado = await this.brain.procesarEntrada(entrada);
        
        // Mostrar respuesta
        setTimeout(() => {
            this.mostrarMensajeBot(resultado.respuesta, resultado.confianza);
            this.actualizarPaneles(resultado);
        }, 500 + Math.random() * 500); // Simular procesamiento
    }

    /**
     * Muestra mensaje del usuario
     */
    mostrarMensajeUsuario(texto) {
        const div = document.createElement('div');
        div.className = 'message user';
        div.innerHTML = `
            <div class="message-content">${this.escaparHtml(texto)}</div>
            <div class="message-avatar">👤</div>
        `;
        this.areaChat.appendChild(div);
        this.scrollAlFinal();
    }

    /**
     * Muestra mensaje de JARVIS
     */
    mostrarMensajeBot(texto, confianza = 100) {
        const div = document.createElement('div');
        div.className = 'message bot';
        
        // Reemplazar saltos de línea
        const textoFormateado = texto.replace(/\n/g, '<br>');
        
        div.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${textoFormateado}</div>
        `;
        this.areaChat.appendChild(div);
        this.scrollAlFinal();
    }

    /**
     * Muestra indicador de procesamiento
     */
    mostrarProcesando() {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.id = 'procesando';
        div.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <span style="animation: blink 1s infinite;">Procesando</span>
                <span style="animation: blink 1s infinite; animation-delay: 0.2s;">.</span>
                <span style="animation: blink 1s infinite; animation-delay: 0.4s;">.</span>
            </div>
        `;
        this.areaChat.appendChild(div);
        this.scrollAlFinal();
    }

    /**
     * Actualiza los paneles de información
     */
    actualizarPaneles(resultado) {
        // Remover indicador de procesamiento
        const procesando = document.getElementById('procesando');
        if (procesando) procesando.remove();
        
        // Panel de desempeño
        this.panelDesempenio.innerHTML = `
            <i class="fas fa-brain"></i>
            <span>Procesando: ${resultado.intencion}</span>
        `;
        
        // Panel de confianza
        this.panelConfianza.innerHTML = `
            <i class="fas fa-chart-pie"></i>
            <span>Confianza: ${resultado.confianza}%</span>
        `;
        
        // Panel de tiempo
        this.panelTiempo.innerHTML = `
            <i class="fas fa-hourglass-end"></i>
            <span>Tiempo: ${resultado.tiempo}ms</span>
        `;
    }

    /**
     * Reconocimiento de voz
     */
    configurarReconocimientoVoz() {
        if (!('webkitSpeechRecognition' in window)) {
            console.log('Reconocimiento de voz no disponible');
            this.botonVoz.disabled = true;
            return;
        }
        
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onstart = () => {
            this.botonVoz.style.background = 'rgba(255, 0, 0, 0.3)';
        };
        
        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            this.inputUsuario.value = transcript;
            this.enviarMensaje();
        };
        
        this.recognition.onend = () => {
            this.botonVoz.style.background = '';
        };
        
        this.recognition.onerror = (event) => {
            console.error('Error en reconocimiento:', event.error);
        };
    }

    /**
     * Inicia reconocimiento de voz
     */
    iniciarReconocimientoVoz() {
        if (this.recognition) {
            this.recognition.start();
        }
    }

    /**
     * Scroll al final del chat
     */
    scrollAlFinal() {
        setTimeout(() => {
            this.areaChat.scrollTop = this.areaChat.scrollHeight;
        }, 100);
    }

    /**
     * Escapa caracteres HTML
     */
    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.jarvis = new Jarvis();
    console.log('🤖 JARVIS Inicializado y listo');
});