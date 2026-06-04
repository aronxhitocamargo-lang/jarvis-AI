class AplicacionTareas {
    constructor() {
        this.entradaTarea = document.getElementById('todoInput');
        this.botonAgregar = document.getElementById('addBtn');
        this.listaaTareas = document.getElementById('todoList');
        this.botonesFiltro = document.querySelectorAll('.filter-btn');
        this.botonLimpiar = document.getElementById('clearBtn');
        this.botonTema = document.getElementById('themeToggle');
        this.estadoVacio = document.getElementById('emptyState');
        this.cuentaTodas = document.getElementById('allCount');
        this.cuentaActivas = document.getElementById('activeCount');
        this.cuentaCompletadas = document.getElementById('completedCount');
        this.totalTareas = document.getElementById('totalTasks');
        this.progreso = document.getElementById('progress');
        this.tareas = [];
        this.filtroActual = 'all';
        this.inicializar();
    }
    inicializar() {
        this.cargarTareas();
        this.adjuntarEventos();
        this.cargarTema();
        this.renderizar();
    }
    adjuntarEventos() {
        this.botonAgregar.addEventListener('click', () => this.agregarTarea());
        this.entradaTarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.agregarTarea();
        });
        this.botonesFiltro.forEach(btn => {
            btn.addEventListener('click', (e) => this.establecerFiltro(e.target.closest('.filter-btn')));
        });
        this.botonLimpiar.addEventListener('click', () => this.limpiarCompletadas());
        this.botonTema.addEventListener('click', () => this.cambiarTema());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cancelarEdicion();
        });
    }
    agregarTarea() {
        const texto = this.entradaTarea.value.trim();
        if (texto === '') {
            this.entradaTarea.focus();
            return;
        }
        const tarea = {
            id: Date.now(),
            texto: texto,
            completada: false,
            creadaEn: new Date().toISOString()
        };
        this.tareas.unshift(tarea);
        this.guardarTareas();
        this.entradaTarea.value = '';
        this.entradaTarea.focus();
        this.renderizar();
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
            }, 300);
        }
    }
    cambiarCompletada(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            this.guardarTareas();
            this.renderizar();
        }
    }
    iniciarEdicion(id) {
        const elemento = document.querySelector(`[data-id="${id}"]`);
        elemento.classList.add('editing');
        const entradaEdicion = elemento.querySelector('.todo-edit');
        entradaEdicion.focus();
        entradaEdicion.select();
    }
    guardarEdicion(id) {
        const elemento = document.querySelector(`[data-id="${id}"]`);
        const entradaEdicion = elemento.querySelector('.todo-edit');
        const nuevoTexto = entradaEdicion.value.trim();
        if (nuevoTexto === '') {
            this.eliminarTarea(id);
            return;
        }
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea && nuevoTexto !== tarea.texto) {
            tarea.texto = nuevoTexto;
            this.guardarTareas();
        }
        this.cancelarEdicion();
    }
    cancelarEdicion() {
        const elementoEdicion = document.querySelector('.todo-item.editing');
        if (elementoEdicion) {
            elementoEdicion.classList.remove('editing');
        }
    }
    establecerFiltro(btn) {
        this.botonesFiltro.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filtroActual = btn.dataset.filter;
        this.renderizar();
    }
    limpiarCompletadas() {
        const conteoCompletadas = this.tareas.filter(t => t.completada).length;
        if (conteoCompletadas === 0) return;
        if (confirm(`¿Estás seguro de que deseas eliminar ${conteoCompletadas} tarea(s) completada(s)?`)) {
            this.tareas = this.tareas.filter(t => !t.completada);
            this.guardarTareas();
            this.renderizar();
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
        switch (this.filtroActual) {
            case 'active':
                return this.tareas.filter(t => !t.completada);
            case 'completed':
                return this.tareas.filter(t => t.completada);
            default:
                return this.tareas;
        }
    }
    actualizarEstadisticas() {
        const total = this.tareas.length;
        const activas = this.tareas.filter(t => !t.completada).length;
        const completadas = this.tareas.filter(t => t.completada).length;
        const porcentajeProgreso = total === 0 ? 0 : Math.round((completadas / total) * 100);
        this.totalTareas.textContent = total;
        this.cuentaTodas.textContent = total;
        this.cuentaActivas.textContent = activas;
        this.cuentaCompletadas.textContent = completadas;
        this.progreso.textContent = `${porcentajeProgreso}%`;
    }
    renderizar() {
        const tareasFiltradas = this.obtenerTareasFiltradas();
        this.listaaTareas.innerHTML = '';
        if (tareasFiltradas.length === 0) {
            this.estadoVacio.classList.add('show');
        } else {
            this.estadoVacio.classList.remove('show');
        }
        tareasFiltradas.forEach(tarea => {
            const li = this.crearElementoTarea(tarea);
            this.listaaTareas.appendChild(li);
        });
        this.actualizarEstadisticas();
    }
    crearElementoTarea(tarea) {
        const li = document.createElement('li');
        li.className = `todo-item ${tarea.completada ? 'completed' : ''}`;
        li.dataset.id = tarea.id;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${tarea.completada ? 'checked' : ''}>
            <span class="todo-text">${this.escaparHtml(tarea.texto)}</span>
            <input type="text" class="todo-edit" value="${this.escaparHtml(tarea.texto)}">
            <div class="todo-actions">
                <button class="todo-action-btn todo-edit-btn" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="todo-action-btn todo-delete-btn" title="Eliminar"><i class="fas fa-trash"></i></button>
                <button class="todo-action-btn todo-save-btn" title="Guardar" style="display:none;"><i class="fas fa-check"></i></button>
            </div>
        `;
        const casilla = li.querySelector('.todo-checkbox');
        const botonEditar = li.querySelector('.todo-edit-btn');
        const botonEliminar = li.querySelector('.todo-delete-btn');
        const botonGuardar = li.querySelector('.todo-save-btn');
        const entradaEdicion = li.querySelector('.todo-edit');
        casilla.addEventListener('change', () => this.cambiarCompletada(tarea.id));
        botonEditar.addEventListener('click', () => this.iniciarEdicion(tarea.id));
        botonEliminar.addEventListener('click', () => this.eliminarTarea(tarea.id));
        botonGuardar.addEventListener('click', () => this.guardarEdicion(tarea.id));
        li.addEventListener('click', (e) => {
            if (li.classList.contains('editing')) {
                if (e.target === botonEditar || e.target.closest('.todo-edit-btn')) {
                    botonGuardar.style.display = 'flex';
                    botonEditar.style.display = 'none';
                }
            }
        });
        entradaEdicion.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.guardarEdicion(tarea.id);
            }
        });
        entradaEdicion.addEventListener('blur', () => {
            this.guardarEdicion(tarea.id);
        });
        return li;
    }
    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
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