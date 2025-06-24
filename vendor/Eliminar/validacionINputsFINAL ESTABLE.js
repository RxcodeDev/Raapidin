        function setInputErrorStyles(el, status) {
    const rootStyles = getComputedStyle(document.documentElement);
    const dangerColor = rootStyles.getPropertyValue('--status-danger').trim();
    const successColor = rootStyles.getPropertyValue('--status-success').trim();

    const color = status === 'danger' ? dangerColor
                : status === 'success' ? successColor
                : '';

    ['borderColor', 'outlineColor', 'color', 'caretColor'].forEach(prop => {
        el.style[prop] = color;
    });
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
        const isSelect = el.tagName === 'SELECT';

        if (isSelect) {
            el.addEventListener('change', () => validateField(el));
            el.addEventListener('blur', () => validateField(el));
            // ❌ No limpiar estilo en focus para SELECT — se mantiene SUCCESS visible
        } else {
            el.addEventListener('focus', () => setInputErrorStyles(el, ''));
            el.addEventListener('input', () => setInputErrorStyles(el, ''));
            el.addEventListener('blur', () => validateField(el));
        }
    });

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => {
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