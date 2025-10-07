import { api, ApiError } from './ApiService.js';
import { loading } from '../utils/managers.js';

export class RequestHandler {
    static async execute(serviceMethod, options = {}) {
        const requestId = Math.random().toString(36).substr(2, 9);
        const { showLoading = true } = options;

        try {
            if (showLoading) loading.addRequest(requestId);

            const result = await serviceMethod();
            return { success: true, data: result };

        } catch (error) {
            const message = error instanceof ApiError ? error.message : 'Error en la operación';
            
            return { 
                success: false, 
                error: message, 
                status: error.status || 0,
                data: error.data || {}
            };

        } finally {
            if (showLoading) loading.removeRequest(requestId);
        }
    }

    static async handleWithCallback(serviceMethod, onSuccess, onError = null, options = {}) {
        const result = await this.execute(serviceMethod, options);
        
        if (result.success) {
            onSuccess(result.data);
        } else if (onError) {
            onError(result.error, result.status, result.data);
        }

        return result;
    }
}