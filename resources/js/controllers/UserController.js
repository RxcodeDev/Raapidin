import { UserService } from "../services/UserService";
import { RequestHandler } from '../services/RequestHandler.js';
import { cache } from '../utils/CacheManager.js';
import { PaginationManager } from '../utils/PaginationManager.js';
import { lazyLoader } from '../utils/LazyLoader.js';

export class UserController {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.pagination = new PaginationManager({ pageSize: 20 });
        this.filters = {};
        this.isLoading = false;
    }
    async loadUsers(useCache = true) {
        const cacheKey = 'users_all';
        if (useCache && cache.has(cacheKey)) {
            this.users = cache.get(cacheKey);
            return { success: true, data: this.users };
        }
        const result = await RequestHandler.execute(
            () => UserService.getAll(),
            { showLoading: true }
        );
        if (result.success) {
            this.users = result.data.data || result.data;
            cache.set(cacheKey, this.users);
        }
        return result;
    }
}
