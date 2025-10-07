import { appApi } from '../api.js';

export const tenantPage = {
    currentData: [],
    
    async init() {
        this.setupEventListeners();
        this.setupSearch();
        await this.loadInitialData();
        this.setupInfiniteScroll();
    },

    setupEventListeners() {
        const createBtn = document.querySelector('#create-tenant-btn');
        const form = document.querySelector('#tenant-form');

        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateForm());
        }

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        const pageButtons = document.querySelectorAll('.pagination-btn');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page) this.loadPage(page);
            });
        });
    },

    setupSearch() {
        const searchInput = document.querySelector('#tenant-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }
    },

    async loadInitialData() {
        const result = await appApi.tenants.loadPage(1);
        if (result.success) {
            this.currentData = result.data;
            this.renderTenants(result.data);
            this.renderPagination(result.meta);
        }
    },

    async loadPage(page) {
        const result = await appApi.tenants.loadPage(page, appApi.tenants.filters);
        if (result.success) {
            this.currentData = result.data;
            this.renderTenants(result.data);
            this.renderPagination(result.meta);
            this.scrollToTop();
        }
    },

    async handleSearch(query) {
        if (query.length >= 2 || query.length === 0) {
            const result = await appApi.tenants.searchTenants(query, 1);
            if (result.success) {
                this.currentData = result.data;
                this.renderTenants(result.data);
                this.renderPagination(result.meta);
            }
        }
    },

    renderTenants(tenants) {
        const container = document.querySelector('#tenants-container');
        if (!container) return;

        container.innerHTML = tenants.map(tenant => `
            <div class="tenant-card" data-id="${tenant.id}">
                <h3>${tenant.business_name}</h3>
                <p>Estado: ${tenant.status}</p>
                <p>Email: ${tenant.owner_email}</p>
                <div class="actions">
                    <button onclick="tenantPage.editTenant('${tenant.id}')">Editar</button>
                    <button onclick="tenantPage.toggleStatus('${tenant.id}', '${tenant.status}')">
                        ${tenant.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderPagination(meta) {
        const container = document.querySelector('#pagination-container');
        if (!container || !meta) return;

        const { currentPage, totalPages, hasNext, hasPrev } = meta;
        
        let paginationHtml = '<div class="pagination">';
        
        if (hasPrev) {
            paginationHtml += `<button class="pagination-btn" data-page="${currentPage - 1}">Anterior</button>`;
        }
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationHtml += `<button class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>`;
        }
        
        if (hasNext) {
            paginationHtml += `<button class="pagination-btn" data-page="${currentPage + 1}">Siguiente</button>`;
        }
        
        paginationHtml += '</div>';
        container.innerHTML = paginationHtml;
        
        this.setupEventListeners();
    },

    setupInfiniteScroll() {
        const container = document.querySelector('#tenants-container');
        if (container) {
            this.sentinel = appApi.tenants.setupLazyLoading(container, async (page) => {
                const result = await appApi.tenants.loadPage(page, appApi.tenants.filters);
                if (result.success) {
                    this.currentData = [...this.currentData, ...result.data];
                    this.appendTenants(result.data);
                }
            });
        }
    },

    appendTenants(tenants) {
        const container = document.querySelector('#tenants-container');
        if (!container) return;

        const tenantsHtml = tenants.map(tenant => `
            <div class="tenant-card" data-id="${tenant.id}">
                <h3>${tenant.business_name}</h3>
                <p>Estado: ${tenant.status}</p>
                <p>Email: ${tenant.owner_email}</p>
                <div class="actions">
                    <button onclick="tenantPage.editTenant('${tenant.id}')">Editar</button>
                    <button onclick="tenantPage.toggleStatus('${tenant.id}', '${tenant.status}')">
                        ${tenant.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>
        `).join('');
        
        if (this.sentinel) {
            this.sentinel.insertAdjacentHTML('beforebegin', tenantsHtml);
        } else {
            container.insertAdjacentHTML('beforeend', tenantsHtml);
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const tenantId = e.target.dataset.tenantId;
        const result = tenantId 
            ? await appApi.tenants.updateTenant(tenantId, data)
            : await appApi.tenants.createTenant(data);

        if (result.success) {
            this.hideForm();
            appApi.tenants.pagination.clearCache();
            await this.loadInitialData();
        }
    },

    async editTenant(id) {
        const result = await appApi.tenants.getTenant(id);
        if (result.success) {
            this.showEditForm(result.data);
        }
    },

    async toggleStatus(id, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const result = await appApi.tenants.updateTenantStatus(id, newStatus);
        
        if (result.success) {
            appApi.tenants.pagination.clearCache();
            await this.loadInitialData();
        }
    },

    scrollToTop() {
        const container = document.querySelector('#tenants-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    showCreateForm() {
        const modal = document.querySelector('#tenant-modal');
        const form = document.querySelector('#tenant-form');
        
        if (form) {
            form.reset();
            delete form.dataset.tenantId;
        }
        
        if (modal) modal.style.display = 'block';
    },

    showEditForm(tenant) {
        const modal = document.querySelector('#tenant-modal');
        const form = document.querySelector('#tenant-form');
        
        if (form) {
            form.dataset.tenantId = tenant.id;
            Object.keys(tenant).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = tenant[key];
            });
        }
        
        if (modal) modal.style.display = 'block';
    },

    hideForm() {
        const modal = document.querySelector('#tenant-modal');
        if (modal) modal.style.display = 'none';
    },

    cleanup() {
        if (this.sentinel) {
            appApi.tenants.lazyLoader.unobserve(this.sentinel);
        }
    }
};

window.tenantPage = tenantPage;