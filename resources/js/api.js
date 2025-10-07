import { TenantController } from './controllers/TenantController.js';
import { loading } from './utils/managers.js';

export class AppApi {
    constructor() {
        this.tenants = new TenantController();
        this.setupGlobalLoading();
    }

    setupGlobalLoading() {
        loading.onLoadingChange((isLoading) => {
            const loadingElement = document.querySelector('.loading-overlay');
            if (loadingElement) {
                loadingElement.style.display = isLoading ? 'flex' : 'none';
            }
        });
    }
}

export const appApi = new AppApi();