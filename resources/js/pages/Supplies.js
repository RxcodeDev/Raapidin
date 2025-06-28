import { SelectToggle } from "../utils/SelectToggle.js";
import { GenerateOptions } from "../utils/GenerateOptions.js";
import { Table } from "../utils/TableGenerator.js";

export class Supplies {
    constructor() {
        console.log('Tenemos acceso a Supplies');
        this.init();
        window.suppliesInstance = this;
    }

    // === INICIALIZACIÓN ===

    async init() {
        this.initForm();
        this.initTable();
        this.initSelectToggle();
        await this.loadDynamicUnits();
        await this.loadSupplies();
    }

    initSelectToggle() {
        this.selectToggle = new SelectToggle('unidad', 'nueva_unidad', 'nueva');
    }

    initTable() {
        this.table = new Table('supplies-tbody', [
            { type: 'number', title: '#' },
            { field: 'nombre', title: 'Nombre' },
            { field: 'unidad', title: 'Unidad' },
            { field: 'costo_unitario', type: 'money', title: 'Costo' },
            { field: 'stock', title: 'Stock' }
        ], [
            { 
                icon: 'settings', 
                click: 'window.suppliesInstance.editSupply', 
                params: ['id', 'nombre'], 
                title: 'Editar' 
            },
            { 
                icon: 'delete', 
                click: 'window.suppliesInstance.deleteSupply', 
                params: ['id', 'nombre'], 
                title: 'Eliminar' 
            }
        ], true);
    }

    initForm() {
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm(form);
            });
        }
    }

    // === CARGA DE DATOS ===
    async loadSupplies() {
        try {
            const response = await fetch('/public/index.php/supplies', { method: 'GET' });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Respuesta no es JSON: ${text.substring(0, 100)}...`);
            }
            
            const supplies = await response.json();
            console.log('Insumos obtenidos:', supplies);
            this.table.render(supplies);
            return supplies;
            
        } catch (error) {
            console.error('Error al cargar insumos:', error);
            return [];
        }
    }

    async loadDynamicUnits() {
        try {
            const units = await this.getFieldValues('unidad', true);
            const options = units.map(unit => ({ value: unit, text: unit }));
            options.push({ value: 'nueva', text: 'Nueva unidad*' });
            
            new GenerateOptions('unidad', options);
        } catch (error) {
            console.error('Error cargando unidades:', error);
            new GenerateOptions('unidad', [
                { value: '', text: 'No se pudo recuperar unidad' }
            ]);
        }
    }

    async getFieldValues(field, unique = false) {
        try {
            let url = `/public/index.php/supplies/field/${field}`;
            if (unique) url += '?unique=true';
            
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Respuesta no es JSON: ${text.substring(0, 100)}...`);
            }
            
            const values = await response.json();
            console.log(`Valores ${unique ? 'únicos' : 'completos'} de ${field}:`, values);
            return values;
            
        } catch (error) {
            console.error(`Error al obtener valores de ${field}:`, error);
            return [];
        }
    }

    // === OPERACIONES CRUD ===
    editSupply(supplyId, supplyName) {
        console.log('Editar insumo:', supplyId, supplyName);
        // TODO: Implementar lógica de edición
    }

    async deleteSupply(supplyId, supplyName) {
        // Confirmar eliminación
        if (!confirm(`¿Estás seguro de que quieres eliminar el insumo "${supplyName}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/public/index.php/supplies/delete/${supplyId}`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Respuesta no es JSON: ${text.substring(0, 100)}...`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.table.remove(supplyId);
                console.log(`Insumo "${supplyName}" eliminado correctamente`);
            } else {
                alert('Error al eliminar: ' + result.message);
            }
            
        } catch (error) {
            console.error('Error al eliminar insumo:', error);
            alert('Error al eliminar insumo: ' + error.message);
        }
    }

    // === MANEJO DE FORMULARIOS ===

    async submitForm(form) {
        const formData = new FormData(form);
        const unidadSeleccionada = formData.get('unidad');
        const unidadFinal = this.determineUnit(unidadSeleccionada);
        
        if (!unidadFinal) return; // Error ya mostrado en determineUnit
        
        const finalFormData = this.createFinalFormData(formData, unidadFinal);

        try {
            const result = await this.sendSupplyData(finalFormData);
            
            if (result.success) {
                await this.handleSuccessfulSubmission(form, result, unidadSeleccionada, finalFormData, unidadFinal);
            } else {
                alert('Error al agregar el insumo: ' + result.message);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Error al enviar el formulario: ' + error.message);
        }
    }

    determineUnit(unidadSeleccionada) {
        if (unidadSeleccionada === 'nueva') {
            if (!this.selectToggle.isValid()) {
                alert('Por favor ingresa nueva unidad');
                return null;
            }
            return this.selectToggle.getInputValue();
        }
        return unidadSeleccionada;
    }

    createFinalFormData(formData, unidadFinal) {
        const finalFormData = new FormData();
        finalFormData.append('nombre', formData.get('nombre'));
        finalFormData.append('unidad', unidadFinal);
        finalFormData.append('costo_unitario', formData.get('costo_unitario'));
        finalFormData.append('stock', formData.get('stock'));
        return finalFormData;
    }

    async sendSupplyData(finalFormData) {
        const response = await fetch('/public/index.php/supplies', {
            method: 'POST',
            body: finalFormData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Respuesta no es JSON: ${text.substring(0, 100)}...`);
        }
        
        return await response.json();
    }

    async handleSuccessfulSubmission(form, result, unidadSeleccionada, finalFormData, unidadFinal) {
        console.log('Insumo agregado correctamente');
        form.reset();
        
        if (unidadSeleccionada === 'nueva') {
            await this.loadDynamicUnits();
        }
        
        // Usar los datos devueltos por el servidor, especialmente el ID real
        const newItem = result.data || {
            id: result.id || Date.now(),
            nombre: finalFormData.get('nombre'),
            unidad: unidadFinal,
            costo_unitario: finalFormData.get('costo_unitario'),
            stock: finalFormData.get('stock')
        };
        
        this.table.add(newItem);
    }
}