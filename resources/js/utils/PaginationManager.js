export class PaginationManager {
    constructor(options = {}) {
        this.currentPage = 1;
        this.pageSize = options.pageSize || 20;
        this.totalItems = 0;
        this.totalPages = 0;
        this.cache = new Map();
        this.prefetchThreshold = options.prefetchThreshold || 2;
        this.maxCacheSize = options.maxCacheSize || 50;
    }

    setData(totalItems, currentPage = 1) {
        this.totalItems = totalItems;
        this.currentPage = currentPage;
        this.totalPages = Math.ceil(totalItems / this.pageSize);
    }

    getPageKey(page, filters = {}) {
        const filterStr = Object.keys(filters).length ? JSON.stringify(filters) : '';
        return `page_${page}_size_${this.pageSize}_${filterStr}`;
    }

    cachePage(page, data, filters = {}) {
        const key = this.getPageKey(page, filters);
        
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            page,
            filters
        });
    }

    getCachedPage(page, filters = {}) {
        const key = this.getPageKey(page, filters);
        return this.cache.get(key);
    }

    shouldPrefetch(currentPage) {
        const nextPage = currentPage + 1;
        const prevPage = currentPage - 1;
        
        return {
            next: nextPage <= this.totalPages && !this.getCachedPage(nextPage),
            prev: prevPage >= 1 && !this.getCachedPage(prevPage)
        };
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const [key] of this.cache) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    getMetadata() {
        return {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
            hasNext: this.currentPage < this.totalPages,
            hasPrev: this.currentPage > 1,
            from: (this.currentPage - 1) * this.pageSize + 1,
            to: Math.min(this.currentPage * this.pageSize, this.totalItems)
        };
    }
}