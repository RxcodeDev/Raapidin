export class GenerateOptions{
    constructor(selectId, option, valueKey = 'value', textKey = 'text'){
        this.select = document.getElementById(selectId);
        this.option = option;
        this.valueKey = valueKey;
        this.textKey = textKey;
        if (!this.select) {
            console.error('Select element not found:', selectId);
            return;
        }
        this.init();
    }

    init() {
        // Solo preservamos las opciones que tengan disabled para mantener la indicacion de opcion en el frontend
        Array.from(this.select.options).forEach(option => {
            if (!option.disabled) {
                option.remove();
            }
        });
        
        // Agregamos las nuevas opciones
        this.option.forEach(opt => {
            const optionElement = document.createElement('option');
            // Por defecto, usamos value y text, pero podemos usar claves personalizadas
            optionElement.value = opt.hasOwnProperty('value') ? opt.value : opt[this.valueKey];
            optionElement.textContent = opt.hasOwnProperty('text') ? opt.text : opt[this.textKey];
            
            // Respetamos las propiedades adicionales como disabled y selected
            if (opt.disabled === true) {
                optionElement.disabled = true;
            }
            if (opt.selected === true) {
                optionElement.selected = true;
            }
            
            this.select.appendChild(optionElement);
        });
    }
    updateOptions(newOptions) {
        this.option = newOptions;
        this.init();
    }
    getSelectedValue() {
        return this.select.value;
    }
    setSelectedValue(value) {
        this.select.value = value;
    }
    getOptions() {
        return Array.from(this.select.options).map(option => ({
            value: option.value,
            text: option.textContent
        }));
    }    
}