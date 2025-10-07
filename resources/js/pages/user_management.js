import { Modal } from '../modules/modals.js';

export const init = async () => {
    initViewToggle();
    initUserModal();
};

export const destroy = async () => {};

const initUserModal = () => {
    new Modal('.user-management__button--add', 'user-modal', '/resources/views/templates/forms/users-form.html');
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


