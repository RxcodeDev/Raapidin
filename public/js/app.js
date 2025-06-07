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

let companyName = 'Rapidin';    //Esto se cambiara a un JSON
let companyIcon = './assets/rapidin.png';

setTitleApp(companyName);
setIconApp(companyIcon);

