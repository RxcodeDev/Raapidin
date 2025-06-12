//Definiciones Raptor
function setTitleApp (companyName) {
    document.title=companyName;
}

function setIconApp (companyIcon) {
    const existingIcon = document.querySelector("link[rel~='icon']");
    const linkElement = existingIcon || Object.assign(document.createElement('link'),{rel: 'icon'});
    linkElement.href = companyIcon;
    if (!existingIcon) document.head.appendChild(linkElement);
}

let companyName = 'La nona';    //Esto se cambiara a un JSON
let companyIcon = './assets/dev.png';

setTitleApp(companyName);
setIconApp(companyIcon);

//Prueba platillos
const saucers = [
    { id: 1, name: 'Rollo Primavera', price: 50, description:''},
    { id: 2, name: 'Arroz', price: 50, description:''},
    { id: 3, name: 'Pollo agridulce', price: 50, description:''},
    { id: 4, name: 'Agua del dia', price: 50, description:''},
    { id: 5, name: 'Refresco', price: 50, description:''}
]

/* document.querySelector('.btn--txt').textContent = saucers[0].name; */
function genarateSelectableSaucers(saucers, containerId) {
    const getContainer = document.getElementById(containerId);
    const getTemplate = getContainer.querySelector('template');
    saucers.forEach(saucer => {
        const cloneTemplate = getTemplate.content.cloneNode(true);
        const getButton = cloneTemplate.querySelector('button');
        const getText = cloneTemplate.querySelector('.btn--txt');
        getButton.setAttribute('saucer-id', saucer.id);
        getText.textContent = saucer.name;
        getContainer.appendChild(cloneTemplate);
    });
}

genarateSelectableSaucers(saucers,'food-items');
genarateSelectableSaucers(saucers,'food-items');



