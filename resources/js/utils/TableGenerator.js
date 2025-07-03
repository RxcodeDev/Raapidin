export class Table {
    constructor(tbody, columns, actions = [], showActions = true) {
        this.tbody = typeof tbody === 'string' ? document.getElementById(tbody) : tbody;
        this.table = this.tbody.closest('table');
        this.thead = this.table?.querySelector('thead');
        this.columns = columns;
        this.actions = actions;
        this.showActions = showActions;
        
        // Auto-agregar columna de acciones si hay acciones definidas Y showActions es true
        if (this.actions.length > 0 && this.showActions && !this.columns.find(col => col.type === 'actions')) {
            this.columns.push({ type: 'actions', title: 'Acciones' });
        }
        
        // Auto-generar headers si existe thead
        if (this.thead) {
            this.generateHeaders();
        }
    }

    generateHeaders() {
        const headerRow = this.thead.querySelector('tr');
        if (headerRow) {
            // Solo agregar headers que falten
            const currentHeaders = headerRow.querySelectorAll('th').length;
            const neededHeaders = this.columns.length;
            
            if (neededHeaders > currentHeaders) {
                // Agregar solo los headers faltantes
                for (let i = currentHeaders; i < neededHeaders; i++) {
                    const col = this.columns[i];
                    const th = document.createElement('th');
                    th.textContent = col.title || col.field || '';
                    headerRow.appendChild(th);
                }
            }
        }
    }

    render(data) {
        this.tbody.innerHTML = data.map((item, i) => this.row(item, i + 1)).join('');
    }

    row(item, num) {
        const cells = this.columns.map(col => this.cell(col, item, num)).join('');
        const id = item.id ? `data-id="${item.id}"` : '';
        return `<tr ${id}>${cells}</tr>`;
    }

    cell(col, item, num) {
        let content = '';
        
        if (col.type === 'number') content = num;
        else if (col.type === 'money') content = `$${item[col.field]}`;
        else if (col.type === 'actions') content = this.getActions(item);
        else if (col.render) content = col.render(item);
        else content = item[col.field] || '';

        const css = col.class ? ` class="${col.class}"` : '';
        return `<td${css}>${content}</td>`;
    }

    getActions(item) {
        if (!this.actions.length || !this.showActions) return '';
        
        const buttons = this.actions.map(action => {
            const params = action.params?.map(p => `'${item[p]}'`).join(',') || `'${item.id}'`;
            return `<span class="material-symbols-outlined" onclick="${action.click}(${params},this)" title="${action.title || ''}">${action.icon}</span>`;
        }).join('');
        
        return `<div class="edit__row">${buttons}</div>`;
    }

    add(item) {
        const num = this.tbody.children.length + 1;
        const rowHtml = this.row(item, num);
        this.tbody.insertAdjacentHTML('beforeend', rowHtml);
    }

    remove(id) {
        const row = this.tbody.querySelector(`[data-id="${id}"]`);
        if (row) {
            row.remove();
            this.renumber();
        }
    }

    renumber() {
        if (this.columns[0]?.type === 'number') {
            Array.from(this.tbody.children).forEach((row, i) => {
                row.cells[0].textContent = i + 1;
            });
        }
   }

    // Método para configurar modal de edición (opcional)
    enableEditModal(dialogId, config = {}) {
        this.dialog = document.getElementById(dialogId);
        if (!this.dialog) {
            console.error(`Dialog con ID '${dialogId}' no encontrado`);
            return;
        }
        
        this.editConfig = {
            updateUrl: config.updateUrl || null,
            onBeforeEdit: config.onBeforeEdit || null,
            onAfterEdit: config.onAfterEdit || null,
            ...config
        };
        
        this.setupEditModal();
    }

    setupEditModal() {
        if (!this.dialog) return;
        
        const closeBtn = this.dialog.querySelector('.dialog-close');
        const cancelBtn = this.dialog.querySelector('[value="cancel"]');
        const form = this.dialog.querySelector('form');
        
        // Event listeners para cerrar
        closeBtn?.addEventListener('click', () => this.closeEditModal());
        cancelBtn?.addEventListener('click', () => this.closeEditModal());
        
        // Event listener para el formulario
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSubmit(form);
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog.open) {
                this.closeEditModal();
            }
        });
    }

    openEditModal(itemId) {
        if (!this.dialog) {
            console.error('Modal de edición no configurado');
            return;
        }
        
        // Buscar la fila y extraer datos
        const row = this.tbody.querySelector(`[data-id="${itemId}"]`);
        if (!row) {
            console.error('Fila no encontrada');
            return;
        }
        
        const item = this.extractRowData(row, itemId);
        
        // Callback antes de editar
        if (this.editConfig.onBeforeEdit) {
            this.editConfig.onBeforeEdit(item, this.dialog);
        }
        
        // Llenar formulario con datos básicos
        this.populateEditForm(item);
        
        // Abrir dialog nativo
        this.dialog.showModal();
    }

    extractRowData(row, itemId) {
        const item = { id: itemId };
        const cells = row.cells;
        
        // Extraer datos basado en las columnas definidas
        this.columns.forEach((col, index) => {
            if (col.field && cells[index]) {
                let value = cells[index].textContent.trim();
                
                // Limpiar formato de dinero
                if (col.type === 'money') {
                    value = value.replace('$', '');
                }
                
                item[col.field] = value;
            }
        });
        
        return item;
    }

    populateEditForm(item) {
        // Llenar campos que coincidan con item[field]
        Object.keys(item).forEach(key => {
            const input = this.dialog.querySelector(`[name="${key}"], #edit-${key}`);
            if (input) {
                input.value = item[key];
            }
        });
    }

    closeEditModal() {
        if (this.dialog) {
            this.dialog.close();
            const form = this.dialog.querySelector('form');
            form?.reset();
        }
    }

    async handleEditSubmit(form) {
        if (!this.editConfig.updateUrl) {
            console.error('URL de actualización no configurada');
            return;
        }
        
        let formData = new FormData(form);
        const itemId = formData.get('id');
        
        // Validar que el ID sea válido
        if (!itemId || itemId === 'null' || itemId === 'undefined') {
            console.error('ID del item no válido:', itemId);
            alert('Error: ID del elemento no válido. Por favor, recarga la página e intenta de nuevo.');
            return;
        }
        
        console.log('Enviando actualización para ID:', itemId);
        
        // Callback para procesar FormData antes del envío
        if (this.editConfig.processFormData) {
            formData = await this.editConfig.processFormData(formData, form);
            if (!formData) return; // Cancelar si processFormData retorna null/false
        }
        
        try {
            const response = await fetch(this.editConfig.updateUrl.replace('{id}', itemId), {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Actualizar la fila en la tabla
                this.updateRowData(itemId, result.data);
                
                // Callback después de editar
                if (this.editConfig.onAfterEdit) {
                    await this.editConfig.onAfterEdit(result, formData);
                }
                
                this.closeEditModal();
            } else {
                alert('Error al actualizar: ' + result.message);
            }
            
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar: ' + error.message);
        }
    }

    updateRowData(itemId, data) {
        const row = this.tbody.querySelector(`[data-id="${itemId}"]`);
        if (!row) return;
        
        const cells = row.cells;
        
        // Actualizar cada celda basado en las columnas
        this.columns.forEach((col, index) => {
            if (col.field && data[col.field] !== undefined && cells[index]) {
                let content = data[col.field];
                
                if (col.type === 'money') {
                    content = `$${content}`;
                }
                
                cells[index].textContent = content;
            }
        });
    }
}
