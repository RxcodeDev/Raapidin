import { HiddenInput } from "../utils/HiddenInput.js";
import { GenerateOptions } from "../utils/GenerateOptions.js";
export class Supplies{
   constructor(){
    console.log('Tenemos acceso a Supplies');
    this.initForm();
    this.loadSupplies();
    this.hiddenInput = new HiddenInput('nueva_unidad_check', 'nueva_unidad');  
    const units = this.getFieldValues('unidad', true);
    units.then((data) => {
        const optionsSetNew = data.map(unit => ({ value: unit, text: unit }));
        new GenerateOptions('unidad', optionsSetNew);
    });
   }
    
    async loadSupplies(){
        try {
            const response = await fetch('/public/index.php/supplies', {
                method: 'GET'
            });
            
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
            this.renderSupplies(supplies);
            return supplies;
            
        } catch (error) {
            console.error('Error al cargar insumos:', error);
            return [];
        }
    }
    renderSupplies(supplies) {
        const tbody = document.getElementById('supplies-tbody');
        
        tbody.innerHTML = '';
        
        supplies.forEach((supply, index) => {
            this.createSupplyRow(supply, index + 1, tbody);
        });
    }
    
    createSupplyRow(supply, rowNumber, tbody) {
        const row = document.createElement('tr');
        
        const cells = [
            rowNumber,
            supply.nombre,
            supply.unidad,
            `$${supply.costo_unitario}`,
            supply.stock
        ];
        
        cells.forEach(cellContent => {
            const cell = document.createElement('td');
            cell.textContent = cellContent;
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    }
    
    addNewRowToTable(supply) {
        const tbody = document.getElementById('supplies-tbody');
        const currentRows = tbody.querySelectorAll('tr').length;
        
        this.createSupplyRow(supply, currentRows + 1, tbody);
    }    

    initForm(){
        const form = document.querySelector('form');
        if (form){
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm(form);
            });
        }
    }
    async submitForm(form){
        const formData = new FormData(form);

        try {
            const response = await fetch('/public/index.php/supplies', {
                method: 'POST',
                body: formData
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
            if (result.success){
                alert('Insumo agregado correctamente');
                form.reset();            
                this.addNewRowToTable({
                    nombre: formData.get('nombre'),
                    unidad: formData.get('unidad'),
                    costo_unitario: formData.get('costo_unitario'),
                    stock: formData.get('stock')
                });
            }else {
                alert('Error al agregar el insumo: ' + result.message);
            }
        }   catch (error){
            console.error('Error al enviar el formulario:', error);
            alert('Error al enviar el formulario: ' + error.message);
        }
    }
    async getFieldValues(field, unique = false) {
        try {
            let url = `/public/index.php/supplies/field/${field}`;
            
            // Solo agregar parámetro si queremos únicos
            if (unique) {
                url += '?unique=true';
            }
            
            const response = await fetch(url, {
                method: 'GET'
            });
            
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
}