const boton = document.getElementById('btnSaludo');
const mensaje = document.getElementById('mensaje');

boton.addEventListener('click', () => {
  mensaje.textContent = '¡Hola! Esta es una página web básica con JavaScript.';
});
