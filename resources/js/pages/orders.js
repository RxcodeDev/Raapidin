export const init = async () => {
    console.log('Módulo Orders cargado');
    
    const orderElements = document.querySelectorAll('.order-item');
    orderElements.forEach(element => {
        element.addEventListener('click', handleOrderClick);
    });
};

export const destroy = async () => {
    console.log('Módulo Orders descargado');
    
    const orderElements = document.querySelectorAll('.order-item');
    orderElements.forEach(element => {
        element.removeEventListener('click', handleOrderClick);
    });
};

const handleOrderClick = (event) => {
    console.log('Order clicked:', event.target);
};

export const cleanup = () => {
    
};