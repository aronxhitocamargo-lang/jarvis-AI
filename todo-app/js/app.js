class AplicacionTareas {
    constructor() {
        // DOM Elements
        this.entradaTarea = document.getElementById('todoInput');
        this.botonAgregar = document.getElementById('addBtn');
        this.listaTareas = document.getElementById('todoList');
        this.botonesFiltro = document.querySelectorAll('.filter-btn');
        this.botonLimpiar = document.getElementById('clearBtn');
        this.botonTema = document.getElementById('themeToggle');
        this.estadoVacio = document.getElementById('emptyState');
        
        // Search Elements
        this.entradaBusqueda = document.getElementById('searchInput');
        this.cajasugerencias = document.getElementById('suggestions');
        this.botonVoz = document.getElementById('voiceBtn');
        
        // Counts
        this.cuentaTodas = document.getElementById('allCount');
        this.cuentaActivas = document.getElementById('activeCount');
        this.cuentaCompletadas = document.getElementById('completedCount');
        this.cuentaUrgentes = document.getElementById('urgentCount');
        this.totalTareas = document.getElementById('totalTasks');
        this.completadosStats = document.getElementById('completedStats');
        this.progreso = document.getElementById('progress');
        
        // AI Elements
        this.sugerenciasIA = document.getElementById('aiSuggestions');
        this.performanceScore = document.getElementById('performanceScore');
        this.selectPrioridad = document.getElementById('prioritySelect');
        
        // State
        this.tareas = [];
        this.filtroActual = 'all';
        this.motorIA = new MotorIA();
        this.busquedaActual = '';
        
        this.inicializar();
    }

    inicializar() {
        this.cargarTareas();
        this.adjuntarEventos();
        this.cargarTema();
        this.renderizar();
        this.actualizarSugerenciasIA();
    }

    adjuntarEventos() {
        // Agregar tarea
        this.botonAgregar.addEventListener('click', () => this.agregarTarea());
        this.entradaTarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.agregarTarea();
        });
        this.entradaTarea.addEventListener('input', (e) => this.mostrarSugerencias(e.target.value));

        // Búsqueda
        this.entradaBusqueda.addEventListener('input', (e) => {
            this.busquedaActual = e.target.value;
            this.renderizar();
        });

        // Búsqueda por voz
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'es-ES';
            this.botonVoz.addEventListener('click', () => recognition.start());
            recognition.onresult = (event) => {
                const texto = event.results[0][0].transcript;
                this.entradaBusqueda.value = texto;
                this.busquedaActual = texto;
                this.renderizar();
            };
        } else {
            this.botonVoz.style.display = 'none';
        }

        // Filtros
        this.botonesFiltro.forEach(btn => {
            btn.addEventListener('click', (e) => this.establecerFiltro(e.target.closest('.filter-btn')));
        });

        // Limpiar
        this.botonLimpiar.addEventListener('click', () => this.limpiarCompletadas());

        // Tema
        this.botonTema.addEventListener('click', () => this.cambiarTema());
    }

    mostrarSugerencias(texto) {
        if (!texto.trim()) {
            this.cajasugerencias.innerHTML = '';
            return;
        }

        const analisis = this.motorIA.analizarTexto(texto);
        let html = '<div class="suggestion-item">';
        html += `<strong>Categoría detectada:</strong> ${this.traducirCategoria(analisis.categoria)}<br>`;
        html += `<strong>Prioridad sugerida:</strong> ${this.traducirPrioridad(analisis.prioridad)}<br>`;
        
        if (analisis.sugerencias.length > 0) {
            html += '<strong>Tareas relacionadas:</strong><ul>';
            analisis.sugerencias.forEach(s => {
                html += `<li>${s}</li>`;
            });
            html += '</ul>';
        }
        html += '</div>';
        
        this.cajasugerencias.innerHTML = html;
    }

    agregarTarea() {
        const texto = this.entradaTarea.value.trim();
        if (texto === '') {
            this.entradaTarea.focus();
            return;
        }

        const analisis = this.motorIA.analizarTexto(texto);
        const prioridad = this.selectPrioridad.value;

        const tarea = {
            id: Date.now(),
            texto: texto,
            completada: false,
            creadaEn: new Date().toISOString(),
            categoria: analisis.categoria,
            prioridad: prioridad,
            sugerencias: analisis.sugerencias
        };

        this.tareas.unshift(tarea);
        this.guardarTareas();
        this.entradaTarea.value = '';
        this.selectPrioridad.value = 'media';
        this.cajasugerencias.innerHTML = '';
        this.entradaTarea.focus();
        this.renderizar();
        this.actualizarSugerenciasIA();
    }

    eliminarTarea(id) {
        const indice = this.tareas.findIndex(tarea => tarea.id === id);
        if (indice !== -1) {
            const elemento = document.querySelector(`[data-id="${id}"]`);
            elemento.classList.add('removing');
            setTimeout(() => {
                this.tareas.splice(indice, 1);
                this.guardarTareas();
                this.renderizar();
                this.actualizarSugerenciasIA();
            }, 300);
        }
    }

    cambiarCompletada(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            this.guardarTareas();
            this.renderizar();
            this.actualizarSugerenciasIA();
        }
    }

    establecerFiltro(btn) {
        this.botonesFiltro.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filtroActual = btn.dataset.filter;
        this.busquedaActual = '';
        this.entradaBusqueda.value = '';
        this.renderizar();
    }

    limpiarCompletadas() {
        const conteoCompletadas = this.tareas.filter(t => t.completada).length;
        if (conteoCompletadas === 0) return;
        if (confirm(`¿Eliminar ${conteoCompletadas} tarea(s) completada(s)?`)) {
            this.tareas = this.tareas.filter(t => !t.completada);
            this.guardarTareas();
            this.renderizar();
            this.actualizarSugerenciasIA();
        }
    }

    cambiarTema() {
        document.body.classList.toggle('dark-mode');
        const esModoOscuro = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', esModoOscuro ? 'dark' : 'light');
        this.actualizarIconoTema();
    }

    cargarTema() {
        const tema = localStorage.getItem('theme') || 'light';
        if (tema === 'dark') {
            document.body.classList.add('dark-mode');
        }
        this.actualizarIconoTema();
    }

    actualizarIconoTema() {
        const esModoOscuro = document.body.classList.contains('dark-mode');
        const icono = this.botonTema.querySelector('i');
        icono.className = esModoOscuro ? 'fas fa-sun' : 'fas fa-moon';
    }

    obtenerTareasFiltradas() {
        let tareas = this.tareas;

        // Aplicar búsqueda
        if (this.busquedaActual) {
            tareas = this.motorIA.buscar(tareas, this.busquedaActual);
        }

        // Aplicar filtro
        switch (this.filtroActual) {
            case 'active':
                return tareas.filter(t => !t.completada);
            case 'completed':
                return tareas.filter(t => t.completada);
            case 'alta':
                return tareas.filter(t => t.prioridad === 'alta' && !t.completada);
            default:
                return tareas;
        }
    }

    actualizarEstadisticas() {
        const total = this.tareas.length;
        const activas = this.tareas.filter(t => !t.completada).length;
        const completadas = this.tareas.filter(t => t.completada).length;
        const urgentes = this.tareas.filter(t => t.prioridad === 'alta' && !t.completada).length;
        const porcentajeProgreso = total === 0 ? 0 : Math.round((completadas / total) * 100);
        const productividad = this.motorIA.calcularProductividad(this.tareas);

        this.totalTareas.textContent = total;
        this.completadosStats.textContent = completadas;
        this.cuentaTodas.textContent = total;
        this.cuentaActivas.textContent = activas;
        this.cuentaCompletadas.textContent = completadas;
        this.cuentaUrgentes.textContent = urgentes;
        this.progreso.textContent = `${porcentajeProgreso}%`;
        this.performanceScore.textContent = `${productividad}%`;
    }

    actualizarSugerenciasIA() {
        const sugerencias = this.motorIA.generarSugerencias(this.tareas);
        this.sugerenciasIA.innerHTML = sugerencias
            .map(s => `<div class="suggestion-item">💡 ${s}</div>`)
            .join('');
    }

    renderizar() {
        const tareasFiltradas = this.obtenerTareasFiltradas();
        this.listaTareas.innerHTML = '';

        if (tareasFiltradas.length === 0) {
            this.estadoVacio.classList.add('show');
        } else {
            this.estadoVacio.classList.remove('show');
        }

        // Ordenar por prioridad
        const prioridades = { alta: 0, media: 1, baja: 2 };
        tareasFiltradas.sort((a, b) => prioridades[a.prioridad] - prioridades[b.prioridad]);

        tareasFiltradas.forEach(tarea => {
            const li = this.crearElementoTarea(tarea);
            this.listaTareas.appendChild(li);
        });

        this.actualizarEstadisticas();
    }

    crearElementoTarea(tarea) {
        const li = document.createElement('li');
        li.className = `todo-item ${tarea.completada ? 'completed' : ''} priority-${tarea.prioridad}`;
        li.dataset.id = tarea.id;

        const iconoPrioridad = {
            alta: '🔴',
            media: '🟡',
            baja: '🟢'
        }[tarea.prioridad];

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${tarea.completada ? 'checked' : ''}>
            <span class="priority-badge">${iconoPrioridad}</span>
            <span class="todo-text">${this.escaparHtml(tarea.texto)}</span>
            <span class="category-badge">${tarea.categoria}</span>
            <div class="todo-actions">
                <button class="todo-action-btn todo-delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
            </div>
        `;

        const casilla = li.querySelector('.todo-checkbox');
        const botonEliminar = li.querySelector('.todo-delete-btn');

        casilla.addEventListener('change', () => this.cambiarCompletada(tarea.id));
        botonEliminar.addEventListener('click', () => this.eliminarTarea(tarea.id));

        return li;
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    traducirCategoria(categoria) {
        const traducciones = {
            urgente: '🚨 Urgente',
            trabajo: '💼 Trabajo',
            personal: '👤 Personal',
            salud: '❤️ Salud',
            aprendizaje: '📚 Aprendizaje',
            general: '📝 General'
        };
        return traducciones[categoria] || categoria;
    }

    traducirPrioridad(prioridad) {
        return {
            alta: '🔴 Alta',
            media: '🟡 Media',
            baja: '🟢 Baja'
        }[prioridad];
    }

    guardarTareas() {
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }

    cargarTareas() {
        const almacenado = localStorage.getItem('tareas');
        this.tareas = almacenado ? JSON.parse(almacenado) : [];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.aplicacionTareas = new AplicacionTareas();
});