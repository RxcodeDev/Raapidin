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
        el.addEventListener('focus', () => {
            // Solo limpia si no hay valor, si hay valor y es válido, deja el success
            if (!el.value) setInputErrorStyles(el, '');
        });
        el.addEventListener('blur', () => {
            validateField(el);
        });
        if (el.tagName === 'SELECT') {
            el.addEventListener('change', () => {
                validateField(el);
            });
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