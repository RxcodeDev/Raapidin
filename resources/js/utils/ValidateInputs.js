export class ValidateInputs {
  constructor(root = document) {
    this.root = root;
    this.rootStyles = getComputedStyle(document.documentElement);
    this.colorMap = {
      danger: this.rootStyles.getPropertyValue('--status-danger').trim(),
      success: this.rootStyles.getPropertyValue('--status-success').trim()
    };
    this.styleProps = ['borderColor', 'outlineColor', 'color', 'caretColor'];
    this.init();
  }

  applyInputStyles(el, status) {
    const color = this.colorMap[status] || '';
    this.styleProps.forEach(prop => el.style[prop] = color);
  }

  getValidationStatus(el) {
    if (!el) return '';
    if (el.required && !el.value) return 'danger';
    if (el.value && !el.checkValidity()) return 'danger';
    if (el.value && el.checkValidity()) return 'success';
    return '';
  }

  validateAndStyle(el) {
    const status = this.getValidationStatus(el);
    this.applyInputStyles(el, status);
  }

  isValidatable(el) {
    return (
      el instanceof HTMLElement &&
      ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName) &&
      typeof el.checkValidity === 'function'
    );
  }

  init() {
    this.root.addEventListener('input', e => {
      const el = e.target;
      if (this.isValidatable(el)) this.applyInputStyles(el, '');
    });

    this.root.addEventListener('focusin', e => {
      const el = e.target;
      if (this.isValidatable(el) && el.tagName !== 'SELECT') this.applyInputStyles(el, '');
    });

    this.root.addEventListener('change', e => {
      const el = e.target;
      if (this.isValidatable(el)) this.validateAndStyle(el);
    });

    this.root.addEventListener('blur', e => {
      const el = e.target;
      if (this.isValidatable(el)) this.validateAndStyle(el);
    }, true);

    this.root.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', e => {
        const inputs = form.querySelectorAll('input, select, textarea');
        let hasError = false;
        inputs.forEach(el => {
          if (this.isValidatable(el)) {
            this.validateAndStyle(el);
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
}