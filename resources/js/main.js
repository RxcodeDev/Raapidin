import { routes } from "./routes.js";
import { HashRouter } from "./router.js";
import { ValidateInputs } from "./utils/ValidateInputs.js";

export const main = {
    init() {
        const router = new HashRouter(routes);
        const validateInputs = new ValidateInputs(document);
        router.load();
    }
}