import { main } from "../resources/js/main.js";

class App {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.start.bind(this));
        } else {
            this.start();
        }
    }

    async start() {
        try {
            await main.init();
            this.isInitialized = true;
            this.setupGlobalErrorHandling();
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
        }
    }

    setupGlobalErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazado:', event.reason);
        });
    }

    async destroy() {
        if (main.destroy) {
            await main.destroy();
        }
        this.isInitialized = false;
    }
}

new App();