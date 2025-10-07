import { api } from './ApiService.js';

export class TenantService {
    static async getAll(params = {}) {
        return api.get('/api/tenants', params);
    }

    static async getPaginated(page = 1, limit = 20, filters = {}) {
        return api.get('/api/tenants', {
            page,
            limit,
            ...filters
        });
    }

    static async getActive() {
        return api.get('/api/tenants/active');
    }

    static async getById(id) {
        return api.get(`/api/tenants/${id}`);
    }

    static async getBySlug(slug) {
        return api.get(`/api/tenants/slug/${slug}`);
    }

    static async create(data) {
        return api.post('/api/tenants', data);
    }

    static async update(id, data) {
        return api.put(`/api/tenants/${id}`, data);
    }

    static async updateStatus(id, status) {
        return api.patch(`/api/tenants/${id}/status`, { status });
    }
}