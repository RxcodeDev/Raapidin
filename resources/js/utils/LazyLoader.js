export class LazyLoader {
    constructor(options = {}) {
        this.threshold = options.threshold || 200;
        this.observers = new Map();
        this.loadingQueue = new Set();
        this.batchSize = options.batchSize || 5;
        this.debounceTime = options.debounceTime || 150;
    }

    createObserver(callback) {
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.debounce(() => callback(entry.target), this.debounceTime)();
                }
            });
        }, {
            rootMargin: `${this.threshold}px`,
            threshold: 0.1
        });
    }

    observe(element, loadCallback) {
        if (!element || this.observers.has(element)) return;

        const observer = this.createObserver((target) => {
            if (!this.loadingQueue.has(target)) {
                this.loadingQueue.add(target);
                this.processQueue(loadCallback);
            }
        });

        observer.observe(element);
        this.observers.set(element, observer);
    }

    async processQueue(loadCallback) {
        const batch = Array.from(this.loadingQueue).slice(0, this.batchSize);
        this.loadingQueue.clear();

        const promises = batch.map(async (element) => {
            try {
                await loadCallback(element);
                this.unobserve(element);
            } catch (error) {
                console.error('Error en lazy loading:', error);
            }
        });

        await Promise.all(promises);
    }

    unobserve(element) {
        const observer = this.observers.get(element);
        if (observer) {
            observer.unobserve(element);
            this.observers.delete(element);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.loadingQueue.clear();
    }
}

export const lazyLoader = new LazyLoader();