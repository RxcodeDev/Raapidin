import { routes } from "./routes.js";
import { HashRouter } from "./router.js";
import { ValidateInputs } from "./utils/ValidateInputs.js";
import { Supplies } from "./pages/Supplies.js";

export const main = {
    init() {
        const router = new HashRouter(routes);
        /* new ValidateInputs(document); */
        router.load();
        this.initPageSpecificModules();
    },

    initPageSpecificModules() {
        this.checkAndInitModules();
        const observer = new MutationObserver(() => {
            this.checkAndInitModules();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    checkAndInitModules() {
        const suppliesContainer = document.querySelector('.supplies__container');
        if (suppliesContainer && !suppliesContainer.dataset.initialized) {
            new Supplies();
            suppliesContainer.dataset.initialized = 'true';
        }
    }
};