import { routes } from "./routes.js";
import { HashRouter } from "./router.js";
import { ValidateInputs } from "./utils/ValidateInputs.js";
import { Supplies } from "./pages/Supplies.js";

export const main = {
    init() {
        const router = new HashRouter(routes);
        const validateInputs = new ValidateInputs(document);        
        router.load();
        this.initPageScripts();
    },
    initPageScripts() {
        setTimeout(() => {
            if (document.querySelector('.supplies__container')) {
                const supplies = new Supplies();
            }
        }, 100);
    }
}