class Modal {
    constructor(buttonSelector, modalId, resourceUrl = null) {
        this.button = document.querySelector(buttonSelector);
        this.modal = document.getElementById(modalId);
        this.resourceUrl = resourceUrl;
        
        if (!this.button || !this.modal) return;
        
        this.init();
    }
    
    init() {
        this.button.onclick = async () => {
            await this.setupModal();
            this.modal.showModal();
        };
    }
    
    async setupModal() {
        const title = this.modal.dataset.title || 'Modal';
        const icon = this.modal.dataset.icon || 'info';
        const hasForm = this.modal.dataset.hasForm === 'true';
    
        const header = this.createHeader(title, icon);
        const content = await this.createContent(hasForm);
        
        this.modal.innerHTML = `${header}${content}`;
        
        if (hasForm) {
            this.moveFormButtonsToHeader();
        }
        
        this.initEventListeners();
    }
    
    createHeader(title, icon) {
        return `
            <div class="dialog__header">
                <div class="dialog__header-left">
                    <span class="material-symbols-outlined">${icon}</span>
                    <h3>${title}</h3>
                </div>
                <div class="dialog__header-right">
                    <button class="dialog__close" data-close-modal>
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        `;
    }

    moveFormButtonsToHeader() {
        const form = this.modal.querySelector('form');
        const formActions = this.modal.querySelector('.form__actions');
        const headerRight = this.modal.querySelector('.dialog__header-right');
        
        if (formActions && headerRight && form) {
            const buttons = formActions.querySelectorAll('button[data-btn-modal]');
            buttons.forEach(button => {
                const clonedButton = button.cloneNode(true);
                clonedButton.classList.add('dialog__form-button');
                clonedButton.setAttribute('form', form.id);
                
                if (button.type === 'submit') {
                    clonedButton.onclick = () => form.requestSubmit();
                } else if (button.type === 'reset') {
                    clonedButton.onclick = (e) => {
                        e.preventDefault();
                        form.reset();
                        this.closeModal();
                    };
                }
                
                headerRight.insertBefore(clonedButton, headerRight.firstElementChild);
            });
        }
    }

    closeModal() {
        this.modal.close();
    }

    initEventListeners() {
        const closeButton = this.modal.querySelector('[data-close-modal]');
        if (closeButton) {
            closeButton.onclick = () => this.closeModal();
        }
    }
    
    async createContent(hasForm) {
        let contentHtml = '';
        
        if (this.resourceUrl && hasForm) {
            try {
                const response = await fetch(this.resourceUrl);
                contentHtml = await response.text();
            } catch (error) {
                contentHtml = '<p>Error al cargar el contenido</p>';
            }
        }
        
        return `<div class="dialog__content">${contentHtml}</div>`;
    }
}

export { Modal };