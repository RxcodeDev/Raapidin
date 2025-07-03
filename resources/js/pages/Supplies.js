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
        this.configureEditModal();
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

    configureEditModal() {
        // Configurar el modal reutilizable del TableGenerator
        this.table.enableEditModal('edit-dialog', {
            updateUrl: '/public/index.php/supplies/update/{id}',
            onBeforeEdit: async (item, dialog) => {
                // Cargar unidades en el select del modal
                await this.loadModalUnits();
                
                // Configurar SelectToggle para el modal
                if (!this.editSelectToggle) {
                    this.editSelectToggle = new SelectToggle('edit-unidad', 'edit-nueva_unidad', 'nueva');
                }
                
                // Establecer el valor de la unidad después de cargar las opciones
                const editSelect = document.getElementById('edit-unidad');
                if (editSelect && item.unidad) {
                    editSelect.value = item.unidad;
                }
            },
            processFormData: async (formData, form) => {
                // Manejar la lógica de nueva unidad
                const unidadSeleccionada = formData.get('unidad');
                
                if (unidadSeleccionada === 'nueva') {
                    if (!this.editSelectToggle.isValid()) {
                        alert('Por favor ingresa una nueva unidad');
                        return null; // Cancelar el envío
                    }
                    
                    // Crear nuevo FormData con la unidad final
                    const finalFormData = new FormData();
                    finalFormData.append('nombre', formData.get('nombre'));
                    finalFormData.append('unidad', this.editSelectToggle.getInputValue());
                    finalFormData.append('costo_unitario', formData.get('costo_unitario'));
                    finalFormData.append('stock', formData.get('stock'));
                    
                    return finalFormData;
                }
                
                return formData; // Usar FormData original
            },
            onAfterEdit: async (result, formData) => {
                // Si se agregó una nueva unidad, recargar las opciones del formulario principal
                if (formData.get('unidad') !== document.querySelector('#edit-unidad').value) {
                    await this.loadDynamicUnits();
                }
                console.log('Insumo actualizado correctamente');
            }
        });
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
        console.log('Editando supply con ID:', supplyId, 'Nombre:', supplyName);
        // Usar el modal reutilizable del TableGenerator
        this.table.openEditModal(supplyId);
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
        console.log('Insumo agregado correctamente', result);
        form.reset();
        
        if (unidadSeleccionada === 'nueva') {
            await this.loadDynamicUnits();
        }
        
        // Verificar que tenemos un ID válido del servidor
        let itemId = result.data?.id || result.id;
        
        if (!itemId) {
            console.error('Servidor no devolvió un ID válido:', result);
            // En lugar de usar Date.now(), recargar la tabla completa
            await this.loadSupplies();
            return;
        }
        
        // Crear el nuevo item con el ID real del servidor
        const newItem = {
            id: itemId,
            nombre: finalFormData.get('nombre'),
            unidad: unidadFinal,
            costo_unitario: finalFormData.get('costo_unitario'),
            stock: finalFormData.get('stock'),
            ...result.data // Agregar cualquier dato adicional del servidor
        };
        
        this.table.add(newItem);
    }

    async loadModalUnits() {
        try {
            const units = await this.getFieldValues('unidad', true);
            const editSelect = document.getElementById('edit-unidad');
            
            // Limpiar opciones existentes excepto la primera
            editSelect.innerHTML = '<option value="" disabled>Selecciona una unidad</option>';
            
            // Agregar las unidades
            units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit;
                option.textContent = unit;
                editSelect.appendChild(option);
            });
            
            // Agregar opción "nueva unidad"
            const newOption = document.createElement('option');
            newOption.value = 'nueva';
            newOption.textContent = 'Nueva unidad*';
            editSelect.appendChild(newOption);
            
        } catch (error) {
            console.error('Error cargando unidades para modal:', error);
        }
    }
}