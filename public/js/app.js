class AppConfig {
    constructor() {
        this.config = {
            companyName: 'La nona',
            companyIcon: './assets/dev.png'
        };
        this.init();
    }

    init() {
        this.setTitle(this.config.companyName);
        this.setIcon(this.config.companyIcon);
    }

    setTitle(title) {
        document.title = title;
    }

    setIcon(iconPath) {
        const existingIcon = document.querySelector("link[rel~='icon']");
        const linkElement = existingIcon || Object.assign(document.createElement('link'), {rel: 'icon'});
        linkElement.href = iconPath;
        if (!existingIcon) document.head.appendChild(linkElement);
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.init();
    }
}

new AppConfig();




