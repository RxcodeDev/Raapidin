import { api } from './ApiService.js';

export class UserService {
    static async getAll(params = {}) {
        return api.get('/api/users', params);
    }

    static async getPaginated(page = 1, limit = 20, filters = {}) {
        return api.get('/api/users', {
            page,
            limit,
            ...filters
        });
    }
}
