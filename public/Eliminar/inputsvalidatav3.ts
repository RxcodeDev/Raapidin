        function setInputErrorStyles(el, status) {
    const danger = getComputedStyle(document.documentElement).getPropertyValue('--status-danger');
    const success = getComputedStyle(document.documentElement).getPropertyValue('--status-success');
    if (status === 'danger') {
        el.style.borderColor = danger;
        el.style.outline = danger;
        el.style.color = danger;
        el.style.caretColor = danger;
    } else if (status === 'success') {
        el.style.borderColor = success;
        el.style.outline = success;
        el.style.color = success;
        el.style.caretColor = success;
    } else {
        el.style.borderColor = '';
        el.style.outline = '';
        el.style.color = '';
        el.style.caretColor = '';
    }
}

function validateField(el) {
    if (!el.value && el.required) {
        setInputErrorStyles(el, 'danger');
    } else if (el.value && !el.checkValidity()) {
        setInputErrorStyles(el, 'danger');
    } else if (el.value && el.checkValidity()) {
        setInputErrorStyles(el, 'success');
    } else {
        setInputErrorStyles(el, '');
    }
}

function setupInputValidation(selector = 'input, select') {
    const fields = document.querySelectorAll(selector);

    fields.forEach(el => {
        if (el.tagName === 'SELECT') {
            // Aplica success/error en change y blur
            el.addEventListener('change', () => validateField(el));
            el.addEventListener('blur', () => validateField(el));
            // NO limpiar en focus para select, así el success se mantiene
        } else {
            // Para input: limpia al enfocar o escribir, valida al salir
            el.addEventListener('focus', () => setInputErrorStyles(el, ''));
            el.addEventListener('input', () => setInputErrorStyles(el, ''));
            el.addEventListener('blur', () => validateField(el));
        }
    });

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function (e) {
            let hasError = false;
            fields.forEach(el => {
                validateField(el);
                if (!el.checkValidity()) {
                    hasError = true;
                }
            });
            // if (hasError) e.preventDefault();
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupInputValidation();
});