import { TableGenerator } from "../utils/TableGenerator.js";

export class Users {
    constructor() {
        console.log('Tenemos acceso a Users');
        this.initTable();
        this.loadUsers();
        window.usersInstance = this;
    }

    initTable() {
        const tableConfig = {
            tableId: 'users-table',
            tbodyId: 'users-tbody',
            instanceName: 'usersInstance',
            columns: [
                { type: 'rowNumber' },
                { field: 'nombre', type: 'text' },
                { field: 'email', type: 'text' },
                { field: 'rol', type: 'text' },
                { field: 'created_at', type: 'text' },
                { 
                    type: 'actions',
                    className: 'actions-cell'
                }
            ],
            actions: [
                {
                    method: 'editUser',
                    icon: 'edit',
                    title: 'Editar usuario',
                    params: ['id', 'nombre']
                },
                {
                    method: 'viewUser',
                    icon: 'visibility',
                    title: 'Ver detalles',
                    params: ['id']
                },
                {
                    method: 'deleteUser',
                    icon: 'delete',
                    title: 'Eliminar usuario',
                    params: ['id', 'nombre']
                }
            ]
        };

        this.tableGenerator = new TableGenerator(tableConfig);
    }

    async loadUsers() {
        try {
            const response = await fetch('/public/index.php/users', {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const users = await response.json();
            console.log('Usuarios obtenidos:', users);
            this.tableGenerator.renderData(users);
            return users;
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    }

    editUser(userId, userName, element) {
        console.log('Editar usuario:', userId, userName);
        // Lógica de edición
    }

    viewUser(userId, element) {
        console.log('Ver usuario:', userId);
        // Lógica para ver detalles
    }

    async deleteUser(userId, userName, element) {
        if (!confirm(`¿Estás seguro de que quieres eliminar el usuario "${userName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/public/index.php/users/delete/${userId}`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.tableGenerator.removeRowById(userId);
                alert(`Usuario "${userName}" eliminado correctamente`);
            } else {
                alert('Error al eliminar: ' + result.message);
            }
            
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar usuario: ' + error.message);
        }
    }

    // Método para buscar usuarios
    searchUsers(searchTerm, originalData) {
        this.tableGenerator.filterData(searchTerm, originalData);
    }
}
