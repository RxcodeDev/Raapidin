import { TenantService } from '../services/TenantService.js';
import { RequestHandler } from '../services/RequestHandler.js';
import { cache } from '../utils/CacheManager.js';
import { PaginationManager } from '../utils/PaginationManager.js';
import { lazyLoader } from '../utils/LazyLoader.js';

export class TenantController {
    constructor() {
        this.tenants = [];
        this.currentTenant = null;
        this.pagination = new PaginationManager({ pageSize: 20 });
        this.filters = {};
        this.isLoading = false;
    }

    async loadTenants(useCache = true) {
        const cacheKey = 'tenants_all';
        
        if (useCache && cache.has(cacheKey)) {
            this.tenants = cache.get(cacheKey);
            return { success: true, data: this.tenants };
        }

        const result = await RequestHandler.execute(
            () => TenantService.getAll(),
            { showLoading: true }
        );

        if (result.success) {
            this.tenants = result.data.data || result.data;
            cache.set(cacheKey, this.tenants);
        }

        return result;
    }

    async loadPage(page = 1, filters = {}) {
        if (this.isLoading) return { success: false, error: 'Carga en progreso' };

        const cachedPage = this.pagination.getCachedPage(page, filters);
        if (cachedPage) {
            return { success: true, data: cachedPage.data, fromCache: true };
        }

        this.isLoading = true;
        
        const result = await RequestHandler.execute(
            () => TenantService.getPaginated(page, this.pagination.pageSize, filters),
            { showLoading: !cachedPage }
        );

        this.isLoading = false;

        if (result.success) {
            const responseData = result.data;
            
            this.pagination.setData(responseData.total || responseData.meta?.total, page);
            this.pagination.cachePage(page, responseData.data, filters);
            
            this.prefetchNearbyPages(page, filters);
            
            return {
                success: true,
                data: responseData.data,
                meta: this.pagination.getMetadata()
            };
        }

        return result;
    }

    async prefetchNearbyPages(currentPage, filters = {}) {
        const prefetch = this.pagination.shouldPrefetch(currentPage);
        
        const prefetchPromises = [];
        
        if (prefetch.next) {
            prefetchPromises.push(
                TenantService.getPaginated(currentPage + 1, this.pagination.pageSize, filters)
                    .then(data => this.pagination.cachePage(currentPage + 1, data.data, filters))
                    .catch(() => {})
            );
        }
        
        if (prefetch.prev) {
            prefetchPromises.push(
                TenantService.getPaginated(currentPage - 1, this.pagination.pageSize, filters)
                    .then(data => this.pagination.cachePage(currentPage - 1, data.data, filters))
                    .catch(() => {})
            );
        }
        
        await Promise.all(prefetchPromises);
    }

    async searchTenants(query, page = 1) {
        const filters = { search: query };
        this.filters = filters;
        
        if (query !== this.lastQuery) {
            this.pagination.clearCache('search');
            this.lastQuery = query;
        }
        
        return this.loadPage(page, filters);
    }

    setupLazyLoading(container, loadMoreCallback) {
        const sentinel = document.createElement('div');
        sentinel.className = 'pagination-sentinel';
        sentinel.style.height = '1px';
        container.appendChild(sentinel);

        lazyLoader.observe(sentinel, async () => {
            if (!this.isLoading && this.pagination.getMetadata().hasNext) {
                await loadMoreCallback(this.pagination.currentPage + 1);
            }
        });

        return sentinel;
    }

    async getTenant(id) {
        const cacheKey = `tenant_${id}`;
        
        if (cache.has(cacheKey)) {
            return { success: true, data: cache.get(cacheKey) };
        }

        const result = await RequestHandler.execute(
            () => TenantService.getById(id),
            { showLoading: true }
        );

        if (result.success) {
            const tenant = result.data.data || result.data;
            cache.set(cacheKey, tenant);
            this.currentTenant = tenant;
        }

        return result;
    }

    async createTenant(data) {
        const result = await RequestHandler.execute(
            () => TenantService.create(data)
        );

        if (result.success) {
            cache.invalidatePattern('tenants_');
            await this.loadTenants(false);
        }

        return result;
    }

    async updateTenant(id, data) {
        const result = await RequestHandler.execute(
            () => TenantService.update(id, data)
        );

        if (result.success) {
            cache.delete(`tenant_${id}`);
            cache.invalidatePattern('tenants_');
        }

        return result;
    }

    async updateTenantStatus(id, status) {
        const result = await RequestHandler.execute(
            () => TenantService.updateStatus(id, status)
        );

        if (result.success) {
            cache.delete(`tenant_${id}`);
            cache.invalidatePattern('tenants_');
        }

        return result;
    }

    getTenantById(id) {
        return this.tenants.find(tenant => tenant.id === id);
    }

    filterTenants(criteria) {
        return this.tenants.filter(tenant => {
            return Object.keys(criteria).every(key => {
                return tenant[key]?.toLowerCase().includes(criteria[key].toLowerCase());
            });
        });
    }
}