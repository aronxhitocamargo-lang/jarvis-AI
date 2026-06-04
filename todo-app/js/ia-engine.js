/**
 * Motor de IA para análisis inteligente de tareas
 */
class MotorIA {
    constructor() {
        this.palabrasClave = {
            urgente: ['urgente', 'importante', 'asap', 'hoy', 'ahora', 'inmediato', 'crítico'],
            trabajo: ['reunión', 'proyecto', 'código', 'email', 'documento', 'reporte', 'presentación'],
            personal: ['comprar', 'cocinar', 'ejercicio', 'leer', 'llamar', 'visitar'],
            salud: ['médico', 'cita', 'ejercicio', 'dormir', 'comer', 'medicina'],
            aprendizaje: ['aprender', 'estudiar', 'curso', 'tutorial', 'libro', 'capacitación']
        };
    }

    /**
     * Analiza el texto y sugiere tareas relacionadas
     */
    analizarTexto(texto) {
        const textoLower = texto.toLowerCase();
        const sugerencias = [];

        // Detectar categoría
        const categoria = this.detectarCategoria(textoLower);
        
        // Generar sugerencias basadas en la tarea
        if (textoLower.includes('proyecto')) {
            sugerencias.push('Crear plan de proyecto');
            sugerencias.push('Asignar recursos');
            sugerencias.push('Establecer hitos');
        }
        if (textoLower.includes('reunión')) {
            sugerencias.push('Preparar agenda');
            sugerencias.push('Enviar invitaciones');
            sugerencias.push('Revisar notas previas');
        }
        if (textoLower.includes('ejercicio') || textoLower.includes('deporte')) {
            sugerencias.push('Calentar antes');
            sugerencias.push('Hidratarse');
            sugerencias.push('Estirar después');
        }

        return {
            categoria,
            sugerencias: sugerencias.slice(0, 3),
            prioridad: this.calcularPrioridad(textoLower)
        };
    }

    /**
     * Detecta la categoría de la tarea
     */
    detectarCategoria(texto) {
        for (const [categoria, palabras] of Object.entries(this.palabrasClave)) {
            if (palabras.some(palabra => texto.includes(palabra))) {
                return categoria;
            }
        }
        return 'general';
    }

    /**
     * Calcula la prioridad automáticamente
     */
    calcularPrioridad(texto) {
        const palabrasUrgentes = ['urgente', 'importante', 'asap', 'inmediato', 'hoy', 'crítico'];
        if (palabrasUrgentes.some(palabra => texto.includes(palabra))) {
            return 'alta';
        }
        if (texto.includes('mañana') || texto.includes('próximo')) {
            return 'media';
        }
        return 'baja';
    }

    /**
     * Busca tareas inteligentemente
     */
    buscar(tareas, termino) {
        if (!termino) return tareas;
        
        const terminoLower = termino.toLowerCase();
        return tareas.filter(tarea => {
            // Búsqueda por texto
            if (tarea.texto.toLowerCase().includes(terminoLower)) return true;
            
            // Búsqueda por categoría
            if (tarea.categoria && tarea.categoria.toLowerCase().includes(terminoLower)) return true;
            
            // Búsqueda por prioridad
            if (tarea.prioridad && tarea.prioridad.toLowerCase().includes(terminoLower)) return true;
            
            return false;
        });
    }

    /**
     * Genera sugerencias diarias
     */
    generarSugerencias(tareas) {
        const sugerencias = [];
        
        const completadas = tareas.filter(t => t.completada).length;
        const total = tareas.length;
        
        if (total === 0) {
            sugerencias.push('🎯 Comienza agregando tu primera tarea para hoy');
        } else if (completadas === 0 && total > 0) {
            sugerencias.push('⚡ Completa tu primera tarea para comenzar bien el día');
        } else if (completadas === total) {
            sugerencias.push('🎉 ¡Excelente! Has completado todas tus tareas');
        } else {
            const porcentaje = Math.round((completadas / total) * 100);
            sugerencias.push(`📈 Vas al ${porcentaje}% - ¡Sigue adelante!`);
        }
        
        // Sugerencia por urgencia
        const urgentes = tareas.filter(t => !t.completada && t.prioridad === 'alta');
        if (urgentes.length > 0) {
            sugerencias.push(`🔴 Tienes ${urgentes.length} tarea(s) urgente(s)`);
        }
        
        return sugerencias;
    }

    /**
     * Calcula puntuación de productividad
     */
    calcularProductividad(tareas) {
        if (tareas.length === 0) return 0;
        
        const completadas = tareas.filter(t => t.completada).length;
        const porcentaje = Math.round((completadas / tareas.length) * 100);
        
        // Bonus por tareas urgentes completadas
        const urgentesCompletadas = tareas.filter(t => t.completada && t.prioridad === 'alta').length;
        const bonus = urgentesCompletadas * 5;
        
        return Math.min(100, porcentaje + bonus);
    }
}

// Exportar para uso en app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MotorIA;
}