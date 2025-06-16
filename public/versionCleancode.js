document.addEventListener('DOMContentLoaded', () => {
    setupInputValidation();
});

const rootStyles = getComputedStyle(document.documentElement);
const colorMap = {
    danger: rootStyles.getPropertyValue('--status-danger').trim(),
    success: rootStyles.getPropertyValue('--status-success').trim()
};
const styleProps = ['borderColor', 'outlineColor', 'color', 'caretColor'];

function setInputErrorStyles(el, status) {
    const color = colorMap[status] || '';
    styleProps.forEach(prop => el.style[prop] = color);
}

function validateField(el) {
    const isEmptyRequired = el.required && !el.value;
    const isInvalid = el.value && !el.checkValidity();
    const isValid = el.value && el.checkValidity();

    const status = isEmptyRequired || isInvalid ? 'danger'
                 : isValid ? 'success'
                 : '';
    setInputErrorStyles(el, status);
}

function setupInputValidation(selector = 'input, select') {
    const fields = Array.from(document.querySelectorAll(selector));

    fields.forEach(el => {
        const isSelect = el.tagName === 'SELECT';

        if (isSelect) {
            el.addEventListener('change', () => validateField(el));
            el.addEventListener('blur', () => validateField(el));
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
                if (!el.checkValidity()) hasError = true;
            });

            if (hasError) {
                e.preventDefault();
                const firstInvalid = fields.find(f => !f.checkValidity());
                firstInvalid?.focus();
            }
        });
    });
}
