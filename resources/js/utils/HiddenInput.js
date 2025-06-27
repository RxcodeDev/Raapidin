export class HiddenInput {
    constructor(checkboxId, inputId) {
        this.checkbox = document.getElementById(checkboxId);
        this.input = document.getElementById(inputId);
        
        /* Validacion para verificar existencia */
        if (!this.checkbox || !this.input) {
            console.error('Elementos no encontrados:', checkboxId, inputId);
            return;
        }        
        this.init();
    }

    init() {
        this.toggle();        
        // Agregar event listener al checkbox
        this.checkbox.addEventListener('change', () => {
            this.toggle();
        });
    }

    toggle() {
        if (this.checkbox.checked) {
            // Mostrar input
            this.input.style.display = '';
            this.input.removeAttribute('disabled');
        } else {
            // Ocultar input
            this.input.style.display = 'none';
            this.input.setAttribute('disabled', 'disabled');
            this.input.value = '';
        }
    }

    show() {
        this.checkbox.checked = true;
        this.toggle();
    }

    hide() {
        this.checkbox.checked = false;
        this.toggle();
    }

    isVisible() {
        return this.checkbox.checked;
    }
}