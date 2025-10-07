export class HashRouter {
    constructor(routes, onRouteChange = null) {
        this.routes = routes;
        this.onRouteChange = onRouteChange;
        this.mainElement = null;
        this.cache = new Map();
        this.loadedModules = new Map();
        this.currentPage = null;
        this.currentModule = null;
        this.hashChangeHandler = this.load.bind(this);
    }

    init() {
        this.mainElement = document.querySelector('.buensazon__content');
        if (!this.mainElement) {
            console.error('Elemento principal no encontrado');
            return;
        }
        window.addEventListener('hashchange', this.hashChangeHandler);
        this.bindLinks();
        this.load();
    }

    bindLinks() {
        const links = document.querySelectorAll('.navigation__sidebar [data-page]');
        links.forEach(link => {
            link.addEventListener('click', this.handleLinkClick.bind(this));
        });
    }

    handleLinkClick(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        if (page && page !== this.currentPage) {
            location.hash = `#${page}`;
        }
    }

    async loadPageModule(page) {
        if (this.loadedModules.has(page)) {
            return this.loadedModules.get(page);
        }

        try {
            const modulePath = `./pages/${page}.js`;
            const module = await import(modulePath);
            this.loadedModules.set(page, module);
            return module;
        } catch (error) {
            console.warn(`No se encontró módulo para ${page}:`, error.message);
            return null;
        }
    }

    async unloadCurrentModule() {
        if (this.currentModule && this.currentModule.destroy) {
            await this.currentModule.destroy();
        }
        this.currentModule = null;
    }

    async load() {
        const page = location.hash.slice(1) || 'orders';
        
        if (page === this.currentPage) return;
        
        const url = this.routes[page];
        if (!url) {
            console.error(`Ruta no encontrada: ${page}`);
            return;
        }

        try {
            await this.unloadCurrentModule();
            
            let html = this.cache.get(page);
            
            if (!html) {
                const res = await fetch(url);
                if (!res.ok) throw new Error(res.statusText);
                html = await res.text();
                this.cache.set(page, html);
            }
            
            this.mainElement.innerHTML = html;
            this.currentPage = page;
            
            const pageModule = await this.loadPageModule(page);
            if (pageModule && pageModule.init) {
                this.currentModule = pageModule;
                await pageModule.init();
            }
            
            if (this.onRouteChange) {
                this.onRouteChange(page, pageModule);
            }
        } catch (error) {
            this.mainElement.innerHTML = `<p>Error al cargar ${page}: ${error.message}</p>`;
        }
    }

    navigate(page) {
        if (this.routes[page]) {
            location.hash = `#${page}`;
        }
    }

    async destroy() {
        await this.unloadCurrentModule();
        window.removeEventListener('hashchange', this.hashChangeHandler);
        this.cache.clear();
        this.loadedModules.clear();
    }
}

