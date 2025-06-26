export class Supplies{
   constructor(){
    console.log('Tenemos acceso a Supplies');
    this.initForm();
   }
   initForm(){
        const form = document.querySelector('form');
        if (form){
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm(form);
            });
        }
    }
    async submitForm(form){
        const formData = new FormData(form);

        try {
            const response = await fetch('/index.php/supplies', { // <-- Cambiar aquí
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success){
                alert('Insumo agregado correctamente');
                form.reset();
            }else {
                alert('Error al agregar el insumo: ' + result.message);
            }
        }   catch (error){
            console.error('Error al enviar el formulario:', error);
            alert('Error al enviar el formulario. Por favor, inténtelo de nuevo más tarde.');
        }
    }
}