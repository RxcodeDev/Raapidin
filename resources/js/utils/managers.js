export class LoadingManager {
    constructor() {
        this.activeRequests = new Set();
        this.loadingCallbacks = [];
    }

    addRequest(requestId) {
        this.activeRequests.add(requestId);
        this.notifyLoading(true);
    }

    removeRequest(requestId) {
        this.activeRequests.delete(requestId);
        if (this.activeRequests.size === 0) {
            this.notifyLoading(false);
        }
    }

    onLoadingChange(callback) {
        this.loadingCallbacks.push(callback);
    }

    notifyLoading(isLoading) {
        this.loadingCallbacks.forEach(callback => callback(isLoading));
    }

    isLoading() {
        return this.activeRequests.size > 0;
    }
}

export const loading = new LoadingManager();