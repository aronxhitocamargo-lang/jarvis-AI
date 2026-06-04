class TodoApp {
    constructor() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearBtn = document.getElementById('clearBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.emptyState = document.getElementById('emptyState');
        this.allCount = document.getElementById('allCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        this.totalTasks = document.getElementById('totalTasks');
        this.progress = document.getElementById('progress');
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }
    init() {
        this.loadTodos();
        this.attachEventListeners();
        this.loadTheme();
        this.render();
    }
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.closest('.filter-btn')));
        });
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cancelEdit();
        });
    }
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') {
            this.todoInput.focus();
            return;
        }
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    }
    deleteTodo(id) {
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            const element = document.querySelector(`[data-id="${id}"]`);
            element.classList.add('removing');
            setTimeout(() => {
                this.todos.splice(index, 1);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    startEdit(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        item.classList.add('editing');
        const editInput = item.querySelector('.todo-edit');
        editInput.focus();
        editInput.select();
    }
    saveEdit(id) {
        const item = document.querySelector(`[data-id="${id}"]`);
        const editInput = item.querySelector('.todo-edit');
        const newText = editInput.value.trim();
        if (newText === '') {
            this.deleteTodo(id);
            return;
        }
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText !== todo.text) {
            todo.text = newText;
            this.saveTodos();
        }
        this.cancelEdit();
    }
    cancelEdit() {
        const editingItem = document.querySelector('.todo-item.editing');
        if (editingItem) {
            editingItem.classList.remove('editing');
        }
    }
    setFilter(btn) {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.render();
    }
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) return;
        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        this.updateThemeIcon();
    }
    loadTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        this.updateThemeIcon();
    }
    updateThemeIcon() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const icon = this.themeToggle.querySelector('i');
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;
        const progressPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        this.totalTasks.textContent = total;
        this.allCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
        this.progress.textContent = `${progressPercentage}%`;
    }
    render() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';
        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
        filteredTodos.forEach(todo => {
            const li = this.createTodoElement(todo);
            this.todoList.appendChild(li);
        });
        this.updateStats();
    }
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <input type="text" class="todo-edit" value="${this.escapeHtml(todo.text)}">
            <div class="todo-actions">
                <button class="todo-action-btn todo-edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="todo-action-btn todo-delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                <button class="todo-action-btn todo-save-btn" title="Save" style="display:none;"><i class="fas fa-check"></i></button>
            </div>
        `;
        const checkbox = li.querySelector('.todo-checkbox');
        const editBtn = li.querySelector('.todo-edit-btn');
        const deleteBtn = li.querySelector('.todo-delete-btn');
        const saveBtn = li.querySelector('.todo-save-btn');
        const editInput = li.querySelector('.todo-edit');
        checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
        editBtn.addEventListener('click', () => this.startEdit(todo.id));
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        saveBtn.addEventListener('click', () => this.saveEdit(todo.id));
        li.addEventListener('click', (e) => {
            if (li.classList.contains('editing')) {
                if (e.target === editBtn || e.target.closest('.todo-edit-btn')) {
                    saveBtn.style.display = 'flex';
                    editBtn.style.display = 'none';
                }
            }
        });
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit(todo.id);
            }
        });
        editInput.addEventListener('blur', () => {
            this.saveEdit(todo.id);
        });
        return li;
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    loadTodos() {
        const stored = localStorage.getItem('todos');
        this.todos = stored ? JSON.parse(stored) : [];
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});