document.addEventListener('DOMContentLoaded', () => {
  initFormValidation();
});

const rootStyles = getComputedStyle(document.documentElement);
const colorMap = {
  danger: rootStyles.getPropertyValue('--status-danger').trim(),
  success: rootStyles.getPropertyValue('--status-success').trim()
};

const styleProps = ['borderColor', 'outlineColor', 'color', 'caretColor'];

/**
 * Aplica estilos al input en base al estado
 */
const applyInputStyles = (el, status) => {
  const color = colorMap[status] || '';
  styleProps.forEach(prop => el.style[prop] = color);
};

/**
 * Determina el estado de un campo: '', 'danger', 'success'
 */
const getValidationStatus = el => {
  if (!el) return '';
  if (el.required && !el.value) return 'danger';
  if (el.value && !el.checkValidity()) return 'danger';
  if (el.value && el.checkValidity()) return 'success';
  return '';
};

/**
 * Valida y aplica estilo al campo
 */
const validateAndStyle = el => {
  const status = getValidationStatus(el);
  applyInputStyles(el, status);
};

/**
 * Inicializa validación en formularios
 */
function initFormValidation(root = document) {
  root.addEventListener('input', e => {
    const el = e.target;
    if (isValidatable(el)) applyInputStyles(el, '');
  });

  root.addEventListener('focusin', e => {
    const el = e.target;
    if (isValidatable(el) && el.tagName !== 'SELECT') applyInputStyles(el, '');
  });

  root.addEventListener('change', e => {
    const el = e.target;
    if (isValidatable(el)) validateAndStyle(el);
  });

  root.addEventListener('blur', e => {
    const el = e.target;
    if (isValidatable(el)) validateAndStyle(el);
  }, true); // usar capture para blur bubbling

  root.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      const inputs = form.querySelectorAll('input, select, textarea');
      let hasError = false;
      inputs.forEach(el => {
        if (isValidatable(el)) {
          validateAndStyle(el);
          if (!el.checkValidity()) hasError = true;
        }
      });
      if (hasError) {
        e.preventDefault();
        const firstInvalid = Array.from(inputs).find(el => !el.checkValidity());
        firstInvalid?.focus();
      }
    });
  });
}


const isValidatable = el =>
  el instanceof HTMLElement &&
  ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) &&
  typeof el.checkValidity === 'function';
