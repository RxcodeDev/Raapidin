import { routes } from "./routes.js";
import { HashRouter } from "./router.js";

export const main = {
    init() {
        const router = new HashRouter(routes);
        router.load();
    }
}