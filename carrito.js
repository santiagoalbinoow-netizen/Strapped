// === CARRITO ===

// Si ya hay un carrito guardado, lo cargamos
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Mostrar contador en el icono de bolsa
const actualizarContador = () => {
  const contador = document.getElementById("contador-carrito");
  contador.textContent = carrito.length;
};

// Guardar carrito en localStorage
const guardarCarrito = () => {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
};

// Añadir producto al carrito
function agregarAlCarrito(producto) {
  carrito.push(producto);
  guardarCarrito();
  alert(`${producto.nombre} agregado al carrito`);
}

// === Detectar botón "Agregar al carrito" en la página de producto ===
const botonAgregar = document.querySelector(".btn-secundario");

if (botonAgregar) {
  botonAgregar.addEventListener("click", () => {
    const producto = {
      nombre: document.querySelector(".producto-info h1").textContent,
      precio: document.querySelector(".precio").textContent.trim(),
      cantidad: parseInt(document.getElementById("cantidad").value),
      imagen: document.querySelector(".producto-imagen img").src
    };
    agregarAlCarrito(producto);
  });
}

// === Mostrar el carrito ===
const iconoBolsa = document.getElementById("bolsa-icono");
if (iconoBolsa) {
  iconoBolsa.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "carrito.html"; // Página del carrito
  });
}

// Actualiza contador al cargar
actualizarContador();