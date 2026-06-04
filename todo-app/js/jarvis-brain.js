/**
 * JARVIS Brain - Motor de IA Inteligente
 * Sistema de procesamiento de lenguaje natural y búsqueda de información
 */

class JarvisBrain {
    constructor() {
        this.memoriaConversacion = [];
        this.conocimiento = this.inicializarConocimiento();
        this.tiempoUltimaRespuesta = 0;
        this.confianza = 0;
    }

    /**
     * Inicializa la base de conocimiento de JARVIS
     */
    inicializarConocimiento() {
        return {
            clima: {
                palabras_clave: ['clima', 'tiempo', 'lluvia', 'nieve', 'temperatura', 'grados'],
                respuesta: this.buscarClima.bind(this)
            },
            noticias: {
                palabras_clave: ['noticias', 'noticia', 'última', 'reciente', 'hoy', 'última hora'],
                respuesta: this.buscarNoticias.bind(this)
            },
            matematicas: {
                palabras_clave: ['calcular', 'cuanto', 'operación', 'suma', 'resta', 'divide', 'multiplica'],
                respuesta: this.procesarMatematicas.bind(this)
            },
            informacion: {
                palabras_clave: ['quién', 'qué es', 'explica', 'significado', 'definición', 'cuéntame'],
                respuesta: this.buscarInformacion.bind(this)
            },
            asistencia: {
                palabras_clave: ['ayuda', 'cómo', 'puedes hacer', 'qué puedes', 'capacidades'],
                respuesta: this.mostrarCapacidades.bind(this)
            }
        };
    }

    /**
     * Procesa la entrada del usuario y genera una respuesta inteligente
     */
    async procesarEntrada(entrada) {
        const inicio = Date.now();
        entrada = entrada.toLowerCase().trim();

        // Guardar en memoria
        this.memoriaConversacion.push({
            tipo: 'usuario',
            mensaje: entrada,
            timestamp: new Date()
        });

        // Detectar intención
        const intencion = this.detectarIntencion(entrada);
        
        // Procesar según intención
        let respuesta = await this.procesarIntencion(intencion, entrada);

        // Calcular confianza (0-100)
        this.confianza = this.calcularConfianza(entrada, intencion);

        // Tiempo de procesamiento
        this.tiempoUltimaRespuesta = Date.now() - inicio;

        // Guardar respuesta en memoria
        this.memoriaConversacion.push({
            tipo: 'jarvis',
            mensaje: respuesta,
            timestamp: new Date(),
            confianza: this.confianza
        });

        return {
            respuesta,
            confianza: this.confianza,
            tiempo: this.tiempoUltimaRespuesta,
            intencion
        };
    }

    /**
     * Detecta la intención del usuario
     */
    detectarIntencion(entrada) {
        for (const [tipo, datos] of Object.entries(this.conocimiento)) {
            if (datos.palabras_clave.some(palabra => entrada.includes(palabra))) {
                return tipo;
            }
        }
        return 'general';
    }

    /**
     * Procesa la intención detectada
     */
    async procesarIntencion(intencion, entrada) {
        if (this.conocimiento[intencion]) {
            return await this.conocimiento[intencion].respuesta(entrada);
        }
        return this.respuestaInteligente(entrada);
    }

    /**
     * Busca información sobre el clima
     */
    async buscarClima(entrada) {
        // Simular búsqueda real (en producción usaría API real)
        const ciudades = ['Madrid', 'Barcelona', 'Nueva York', 'Londres'];
        const clima = ['Soleado', 'Nublado', 'Lluvia', 'Nieve'];
        const temperatura = Math.floor(Math.random() * 30) + 5;
        
        return `🌡️ El clima actual es ${clima[Math.floor(Math.random() * clima.length)]} con ${temperatura}°C. Humedad 65%, Viento 10 km/h.`;
    }

    /**
     * Busca noticias
     */
    async buscarNoticias(entrada) {
        const noticias = [
            '📰 Última noticia: Avances en tecnología de IA',
            '📰 Economía: Mercados en alza',
            '📰 Ciencia: Nuevo descubrimiento en física cuántica',
            '📰 Tecnología: Apple presenta nuevos productos',
            '📰 Salud: Estudios sobre longevidad'
        ];
        return noticias[Math.floor(Math.random() * noticias.length)];
    }

    /**
     * Procesa operaciones matemáticas
     */
    procesarMatematicas(entrada) {
        // Detectar números y operaciones
        const patron = /(\d+)\s*([+\-*/])\s*(\d+)/;
        const coincidencia = entrada.match(patron);
        
        if (coincidencia) {
            const num1 = parseFloat(coincidencia[1]);
            const operador = coincidencia[2];
            const num2 = parseFloat(coincidencia[3]);
            
            let resultado;
            switch(operador) {
                case '+': resultado = num1 + num2; break;
                case '-': resultado = num1 - num2; break;
                case '*': resultado = num1 * num2; break;
                case '/': resultado = num1 / num2; break;
            }
            
            return `🧮 ${num1} ${operador} ${num2} = ${resultado}`;
        }
        
        return 'No pude procesar la operación. Intenta con: 5 + 3';
    }

    /**
     * Busca información general
     */
    async buscarInformacion(entrada) {
        const baseDatos = {
            'ia': '🤖 IA es Inteligencia Artificial - un sistema que puede aprender y resolver problemas',
            'machine learning': '📚 Machine Learning permite a las máquinas aprender de datos sin estar programadas explícitamente',
            'jarvis': '🎭 JARVIS es el asistente IA de Tony Stark en Marvel - Just A Rather Very Intelligent System',
            'python': '🐍 Python es un lenguaje de programación versátil y fácil de aprender',
            'javascript': '💻 JavaScript es el lenguaje de programación de la web',
        };
        
        for (const [clave, valor] of Object.entries(baseDatos)) {
            if (entrada.includes(clave)) {
                return valor;
            }
        }
        
        return 'Buscaré esa información en mis registros... 🔍 Sin embargo, no tengo datos específicos sobre eso.';
    }

    /**
     * Muestra las capacidades de JARVIS
     */
    mostrarCapacidades(entrada) {
        return `🎯 Mis capacidades incluyen:
• Responder preguntas
• Buscar información
• Realizar cálculos
• Consultar el clima
• Leer noticias
• Aprender de tus patrones
• Conversar de forma inteligente
¿Qué necesitas?`;
    }

    /**
     * Genera respuesta inteligente para consultas generales
     */
    respuestaInteligente(entrada) {
        const respuestas = [
            'Entiendo tu pregunta. Procesando información...',
            'Interesante. Déjame analizar esto...',
            'Veo lo que dices. Aquí está mi perspectiva...',
            'Fascinante. Según mis análisis...',
            'Comprendo. Mi análisis sugiere...'
        ];
        
        const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
        return respuesta;
    }

    /**
     * Calcula el nivel de confianza en la respuesta
     */
    calcularConfianza(entrada, intencion) {
        let confianza = 50; // Base 50%
        
        if (intencion !== 'general') confianza += 30; // +30% si detectó intención
        if (entrada.length > 10) confianza += 10; // +10% si la pregunta es detallada
        if (entrada.includes('?')) confianza += 10; // +10% si es una pregunta clara
        
        return Math.min(100, confianza);
    }

    /**
     * Obtiene el historial de conversación
     */
    obtenerHistorial() {
        return this.memoriaConversacion;
    }

    /**
     * Limpia la memoria de conversación
     */
    limpiarMemoria() {
        this.memoriaConversacion = [];
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JarvisBrain;
}