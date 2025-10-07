import { Modal } from '../modules/modals.js';
import { UserController } from '../controllers/UserController.js';

const userController = new UserController();

export const init = async () => {
    initViewToggle();
    initUserModal();
    initFormSubmit();
};

export const destroy = async () => {};

const initUserModal = () => {
    new Modal('.user-management__button--add', 'user-modal', '/resources/views/templates/forms/users-form.html');
};

const initFormSubmit = () => {
    document.addEventListener('submit', async (e) => {
        if (e.target.id === 'users-form') {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            const result = await userController.createUser(data);
            
            if (result.success) {
                e.target.closest('dialog').close();
                e.target.reset();
            }
        }
    });
};

const initViewToggle = () => {
    const usersTableWrapper = document.getElementById('users-table-wrapper');
    const usersCardsWrapper = document.getElementById('users-cards-wrapper');
    const buttonTableView = document.getElementById('button-table-view');
    const buttonCardsView = document.getElementById('button-cards-view');
    
    if (!usersTableWrapper || !usersCardsWrapper || !buttonTableView || !buttonCardsView) return;

    const toggleView = (hideElement, showElement) => {
        hideElement.style.display = 'none';
        showElement.style.display = 'block';
    };

    buttonTableView.onclick = () => toggleView(usersCardsWrapper, usersTableWrapper);
    buttonCardsView.onclick = () => toggleView(usersTableWrapper, usersCardsWrapper);
};


