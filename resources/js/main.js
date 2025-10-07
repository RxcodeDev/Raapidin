import { routes } from "./routes.js";
import { HashRouter } from "./router.js";

export const main = {
    router: null,
    activeModules: new Set(),
    
    init() {
        this.router = new HashRouter(routes, this.onRouteChange.bind(this));
        this.router.init();
    },

    onRouteChange(page, pageModule) {
        this.cleanupInactiveModules();
        if (pageModule) {
            this.activeModules.add(pageModule);
        }
    },

    cleanupInactiveModules() {
        this.activeModules.forEach(module => {
            if (module.cleanup) {
                module.cleanup();
            }
        });
        this.activeModules.clear();
    },

    async destroy() {
        this.cleanupInactiveModules();
        if (this.router) {
            await this.router.destroy();
        }
    }
};