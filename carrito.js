// =========================
//  🔹 Cargar producto dinámicamente según ?id=
// =========================

const params = new URLSearchParams(window.location.search);
const idProducto = parseInt(params.get("id"));

// Base de datos de productos (puedes ampliar esto)
const productos = [
  {
    id: 1,
    nombre: "Audífonos Bluetooth STRAPPED",
    precio: 120000,
    imagenes: ["Air.png", "Air3.png"],
    descripcion: "Audífonos Bluetooth resistentes al agua y de sonido envolvente."
  },
  {
    id: 2,
    nombre: "Cargador Rápido 25W",
    precio: 85000,
    imagenes: ["Cargador.png"],
    descripcion: "Cargador rápido con puerto USB-C y protección contra sobrecarga."
  },
  {
    id: 3,
    nombre: "Parlante Portátil STRAPPED",
    precio: 160000,
    imagenes: ["Parlante.png"],
    descripcion: "Sonido potente con conexión Bluetooth y batería de larga duración."
  }
];

// Buscamos el producto
const producto = productos.find(p => p.id === idProducto);

// Si estamos en producto.html y el producto existe
if (producto && document.querySelector('.producto-main')) {
  const nombreEl = document.querySelector(".producto-info h1");
  const precioEl = document.querySelector(".precio");
  const imgContainer = document.querySelector(".carrusel-pista");

  if (nombreEl) nombreEl.textContent = producto.nombre;
  if (precioEl) precioEl.innerHTML = `$${producto.precio.toLocaleString()} COP`;
  if (imgContainer && producto.imagenes) {
    imgContainer.innerHTML = producto.imagenes
      .map(img => `<img src="${img}" class="carrusel-img" alt="${producto.nombre}">`)
      .join("");
  }
}



/* =========================
   1) Inicialización y helpers
   ========================= */
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
  renderizarCarrito();
}

// Convierte una cadena de precio en número entero (ej: "$120.000 COP" -> 120000)
function parsePrice(precioStr) {
  if (typeof precioStr === 'number') return precioStr;
  if (!precioStr) return 0;
  // Busca grupos de dígitos y separadores
  const encontrado = precioStr.match(/[\d.,]+/g);
  if (!encontrado) return 0;
  // Tomamos el último grupo (suele ser el precio actual)
  const ultimo = encontrado[encontrado.length - 1];
  // Eliminamos puntos y comas y parseamos
  const limpio = ultimo.replace(/[.,]/g, '');
  const num = parseInt(limpio, 10);
  return isNaN(num) ? 0 : num;
}

/* =========================
   2) Contador (ahora suma cantidades)
   ========================= */
function actualizarContador() {
  const contador = document.getElementById("contador-carrito");
  if (!contador) return;
  const cantidadTotal = carrito.reduce((acc, p) => acc + (p.cantidad || 0), 0);
  contador.textContent = cantidadTotal;
}

/* =========================
   3) Renderizado del carrito (subtotales + total)
   ========================= */
function renderizarCarrito() {
  const carritoBody = document.querySelector('.carrito-body');
  if (!carritoBody) return;

  carritoBody.innerHTML = '';

  if (carrito.length === 0) {
    carritoBody.innerHTML = '<p>EL CARRITO ESTÁ VACÍO</p>';
    carritoBody.style.justifyContent = 'center';
    carritoBody.style.alignItems = 'center';
    carritoBody.style.display = 'flex';
    return;
  }

  carritoBody.style.display = 'block';
  carritoBody.style.justifyContent = 'initial';
  carritoBody.style.alignItems = 'initial';

  // Construimos el HTML de cada producto y calculamos total
  let totalGeneral = 0;

  carrito.forEach((producto, i) => {
    const precioNum = parsePrice(producto.precio);
    const cantidad = Number(producto.cantidad) || 0;
    const subtotal = precioNum * cantidad;
    totalGeneral += subtotal;

    // Crear contenedor del item
    const item = document.createElement('div');
    item.className = 'item-carrito';
    item.innerHTML = `
      <img src="${producto.imagen || ''}" alt="${producto.nombre || ''}">
      <div style="display:flex;flex-direction:column;gap:6px;">
        <h4 style="margin:0;">${producto.nombre || 'Producto'}</h4>
        <p style="margin:0;">Cantidad: ${cantidad}</p>
        <p style="margin:0;">Precio unitario: $${precioNum.toLocaleString()}</p>
        <p style="margin:0;font-weight:700;">Subtotal: $${subtotal.toLocaleString()}</p>
      </div>
      <button class="btn-eliminar" data-index="${i}" title="Eliminar">×</button>
    `;
    carritoBody.appendChild(item);
  });

  // Botón y total al final
  const wrapper = document.createElement('div');
  wrapper.style.marginTop = '12px';

  const totalDiv = document.createElement('div');
  totalDiv.className = 'carrito-total';
  totalDiv.style.textAlign = 'right';
  totalDiv.style.fontWeight = '800';
  totalDiv.style.marginBottom = '10px';
  totalDiv.innerHTML = `Total: $${totalGeneral.toLocaleString()} COP`;

  const checkoutBtn = document.createElement('button');
  checkoutBtn.className = 'btn';
  checkoutBtn.style.width = '100%';
  checkoutBtn.style.marginTop = '6px';
  checkoutBtn.textContent = 'FINALIZAR COMPRA';

  wrapper.appendChild(totalDiv);
  wrapper.appendChild(checkoutBtn);
  carritoBody.appendChild(wrapper);

  // Delegación de evento para botones eliminar (porque se crean dinámicamente)
  const botonesEliminar = carritoBody.querySelectorAll('.btn-eliminar');
  botonesEliminar.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(btn.getAttribute('data-index'));
      if (!isNaN(idx)) eliminarDelCarrito(idx);
    });
  });
}

/* =========================
   4) Agregar al carrito (fusiona por nombre)
   ========================= */
function agregarAlCarrito(producto) {
  if (!producto || !producto.nombre) return;

  // Asegurar campos mínimos y normalizar precio/cantidad
  producto.precio = producto.precio ?? 0;
  producto.cantidad = Number(producto.cantidad) || 1;

  // Buscar producto por nombre (puedes modificar la clave si usas ID)
  const existe = carrito.find(p => p.nombre === producto.nombre);

  if (existe) {
    // Sumar cantidades si ya existe
    existe.cantidad = Number(existe.cantidad) + Number(producto.cantidad);
  } else {
    carrito.push(producto);
  }

  guardarCarrito();
}

/* =========================
   5) Lógica del botón "Agregar al carrito" (usa parsePrice seguro)
   ========================= */
const botonAgregar = document.querySelector(".btn-secundario");
if (botonAgregar) {
  botonAgregar.addEventListener("click", () => {
    // Extraemos los campos desde la página
    const nombreEl = document.querySelector(".producto-info h1");
    const precioEl = document.querySelector(".precio");
    const cantidadInput = document.getElementById("cantidad");
    const imagenEl = document.querySelector(".producto-imagen img");

    const nombre = nombreEl ? nombreEl.textContent.trim() : 'Producto';
    const precioTexto = precioEl ? precioEl.textContent.trim() : '';
    const precioNum = parsePrice(precioTexto);
    const cantidad = cantidadInput ? Number(cantidadInput.value) || 1 : 1;
    const imagen = imagenEl ? imagenEl.src : '';

    const producto = {
      nombre: nombre,
      precio: precioNum, // guardamos el número (más fácil para cálculos)
      cantidad: cantidad,
      imagen: imagen
    };

    agregarAlCarrito(producto);

    // Abrir el panel del carrito (opcional)
    const panel = document.getElementById('carrito-panel');
    const overlay = document.getElementById('overlay-carrito');
    if (panel) panel.classList.add('activo');
    if (overlay) overlay.classList.add('activo');
    panel.style.animation = 'slideIn 0.45s cubic-bezier(0.25, 1, 0.3, 1)';
  });
}

/* =========================
   6) Inicialización al cargar la página
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();
  renderizarCarrito();
});

/* =========================
   7) Botones +/- cantidad (mantengo tu lógica)
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const inputCantidad = document.getElementById('cantidad');
  const botonesCantidad = document.querySelectorAll('.btn-cantidad');

  if (!inputCantidad) return;

  botonesCantidad.forEach(boton => {
    boton.addEventListener('click', () => {
      let cantidadActual = parseInt(inputCantidad.value);
      const min = parseInt(inputCantidad.min) || 1;

      if (boton.textContent.trim() === '+') {
        cantidadActual++;
      } else if (boton.textContent.trim() === '-') {
        if (cantidadActual > min) cantidadActual--;
      }
      inputCantidad.value = cantidadActual;
    });
  });
});

/* =========================
   8) Eliminar producto por índice
   ========================= */
function eliminarDelCarrito(index) {
  if (typeof index !== 'number' || index < 0 || index >= carrito.length) return;
  carrito.splice(index, 1);
  guardarCarrito();
}

/* =========================
   9) Mantengo tu carrusel + modal (no los modifiqué, solo los dejo abajo)
   ========================= */
   
document.addEventListener('DOMContentLoaded', () => {
  const pista = document.querySelector('.carrusel-pista');
  const imagenes = document.querySelectorAll('.carrusel-img');
  const btnPrev = document.querySelector('.carrusel-btn.prev');
  const btnNext = document.querySelector('.carrusel-btn.next');
  let indice = 0;

  if (!pista || imagenes.length === 0) return;

  function actualizarCarrusel() {
    pista.style.transform = `translateX(-${indice * 100}%)`;
    btnPrev.style.opacity = indice === 0 ? '0.3' : '1';
    btnNext.style.opacity = indice === imagenes.length - 1 ? '0.3' : '1';
  }

  btnNext.addEventListener('click', () => {
    if (indice < imagenes.length - 1) indice++;
    actualizarCarrusel();
  });

  btnPrev.addEventListener('click', () => {
    if (indice > 0) indice--;
    actualizarCarrusel();
  });

  // Soporte táctil
  let startX = 0;
  pista.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  pista.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && indice < imagenes.length - 1) indice++;
      else if (diff > 0 && indice > 0) indice--;
      actualizarCarrusel();
    }
  });

  actualizarCarrusel();
});

// Espera a que cargue el DOM
          document.addEventListener('DOMContentLoaded', function() {
            // Buscamos el <a> que contiene la img del carrito (seguro existe)
            const imgCarrito = document.querySelector('.iconos img[alt="Carrito"]');
            const btnCarrito = imgCarrito ? imgCarrito.closest('a') : null;

            const panelCarrito = document.getElementById('carrito-panel');
            const cerrarCarrito = document.getElementById('cerrar-carrito');
            const overlay = document.getElementById('overlay-carrito');

            if (!btnCarrito) {
              console.error('No se encontró el botón del carrito (a > img[alt="Carrito"])');
              return;
            }
            if (!panelCarrito || !cerrarCarrito || !overlay) {
              console.error('Faltan elementos del panel del carrito (panel, cerrar o overlay).');
              return;
            }

            // Abrir
            btnCarrito.addEventListener('click', function(e) {
              e.preventDefault(); // evita navegación si es <a href="#">
              panelCarrito.classList.add('activo');
              overlay.classList.add('activo');
              // opcional: cerrar menu responsive si está abierto
              const menuCheckbox = document.getElementById('menu');
              if (menuCheckbox) menuCheckbox.checked = false;
            });

            // Cerrar con botón
            cerrarCarrito.addEventListener('click', function() {
              panelCarrito.classList.remove('activo');
              overlay.classList.remove('activo');
            });

            // Cerrar al clicar overlay
            overlay.addEventListener('click', function() {
              panelCarrito.classList.remove('activo');
              overlay.classList.remove('activo');
            });

            // cerrar con ESC
            document.addEventListener('keydown', function(e) {
              if (e.key === 'Escape') {
                panelCarrito.classList.remove('activo');
                overlay.classList.remove('activo');
              }
            });
          });

  try {
  // usa let o var para evitar colisión global si se ejecuta dos veces
  let modal = document.getElementById("authModal");
  const openBtn = document.getElementById("openLogin");
  const mobileLogin = document.getElementById("loginBtn");
  const closeBtn = document.getElementById("closeModal");
  const loginToggle = document.getElementById("loginToggle");
  const registerToggle = document.getElementById("registerToggle");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const menuCheckbox = document.getElementById("menu");

  if (openBtn) openBtn.addEventListener("click", e => { e.preventDefault(); if (modal) modal.style.display = "flex"; });
  if (mobileLogin) mobileLogin.addEventListener("click", e => { e.preventDefault(); if (modal) modal.style.display = "flex"; if (menuCheckbox) menuCheckbox.checked = false; });
  if (closeBtn) closeBtn.addEventListener("click", () => { if (modal) modal.style.display = "none"; });
  window.addEventListener("click", e => { if (e.target === modal) if (modal) modal.style.display = "none"; });

  if (loginToggle && registerToggle && loginForm && registerForm) {
    loginToggle.addEventListener("click", () => {
      loginToggle.classList.add("active");
      registerToggle.classList.remove("active");
      loginForm.classList.add("active");
      registerForm.classList.remove("active");
    });
    registerToggle.addEventListener("click", () => {
      registerToggle.classList.add("active");
      loginToggle.classList.remove("active");
      registerForm.classList.add("active");
      loginForm.classList.remove("active");
    });
  }
} catch (err) {
  console.warn('[carrito.js] modal error (ignorado):', err);
}
