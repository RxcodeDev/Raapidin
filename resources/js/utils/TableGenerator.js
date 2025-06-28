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
}
