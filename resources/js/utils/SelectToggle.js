export class SelectToggle {
    constructor(selectId, inputId, triggerValue = 'otra') {
        this.select = document.getElementById(selectId);
        this.input = document.getElementById(inputId);
        this.triggerValue = triggerValue;
        
        /* Validacion para verificar existencia */
        if (!this.select || !this.input) {
            console.error('Elementos no encontrados:', selectId, inputId);
            return;
        }        
        this.init();
    }

    init() {
        this.toggle();        
        // Agregar event listener al select
        this.select.addEventListener('change', () => {
            this.toggle();
        });
    }

    toggle() {
        if (this.select.value === this.triggerValue) {
            // Mostrar input
            this.input.style.display = '';
            this.input.removeAttribute('disabled');
            this.input.setAttribute('required', 'required');
            this.input.focus();
        } else {
            // Ocultar input
            this.input.style.display = 'none';
            this.input.setAttribute('disabled', 'disabled');
            this.input.removeAttribute('required');
            this.input.value = '';
        }
    }

    show() {
        this.select.value = this.triggerValue;
        this.toggle();
    }

    hide() {
        if (this.select.options.length > 0) {
            this.select.selectedIndex = 0;
        }
        this.toggle();
    }

    isVisible() {
        return this.select.value === this.triggerValue;
    }

    // Método para cambiar el valor trigger dinámicamente
    setTriggerValue(newValue) {
        this.triggerValue = newValue;
        this.toggle();
    }

    // Método para obtener el valor actual
    getCurrentValue() {
        return this.select.value;
    }

    // Método para obtener el input value si está visible
    getInputValue() {
        return this.isVisible() ? this.input.value : null;
    }

    // Método para validar que el input tenga valor cuando es requerido
    isValid() {
        if (this.isVisible()) {
            return this.input.value && this.input.value.trim() !== '';
        }
        return true; // Si no está visible, es válido
    }
}
