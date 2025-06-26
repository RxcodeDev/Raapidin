export class Supplies{
   constructor(){
    console.log('Tenemos acceso a Supplies');
    this.initForm();
    this.loadSupplies();
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
    /* Obtener unidad con getbyfield*/
    


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
                    unidad: formData.get('nueva_unidad'),
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
}