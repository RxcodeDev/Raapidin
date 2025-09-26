export class HashRouter{
    constructor(routes){
        this.routes = routes;
        this.mainElement = document.querySelector('.buensazon__content');
        window.addEventListener('hashchange', () => this.load());
        this.bindLinks();
    }
    bindLinks(){
        document.querySelectorAll('.navigation__sidebar [data-page]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const page = link.dataset.page;
                location.hash = `#${page}`;
            });
        });
    }
    async load(){
        const page = location.hash.slice(1) || 'orders';
        const url = this.routes[page];
        if (!url) return console.error(`Ruta no encontrada: ${page}`);

        try {
            const res = await fetch(url);
            if(!res.ok) throw new Error(res.statusText);
            const html = await res.text();
            this.mainElement.innerHTML = html;
        }catch (error){
            this.mainElement.innerHTML = `<p>Error al cargar ${page}: ${error.message}</p>`;            
        }
    }
}

