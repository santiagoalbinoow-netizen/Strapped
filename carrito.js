// =========================
//  carrito.js (corregido)
// =========================

// =========================
//  🔹 Cargar producto dinámicamente según ?id=
// =========================
const params = new URLSearchParams(window.location.search);
const idProducto = parseInt(params.get("id"));

// Base de datos de productos (puedes ampliar esto)
const productos = [
  {
    id: 1,
    nombre: "Audífonos Bluetooth",
    precio: 120000.00,
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
  checkoutBtn.addEventListener('click', () => {
      // ✅ Acción correcta: solo redirigir a la página de pagos
      window.location.href = 'Pagos.html';
  });

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

// ===============================
//  PANEL DEL CARRITO (ABRIR / CERRAR) - REPARADO
//  Reemplazar el bloque anterior por este
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Intentar encontrar el botón del carrito por varios selectores posibles
  let btnCarrito = document.getElementById("btn-carrito") || 
                   document.querySelector(".bolsa") || 
                   document.querySelector("a.bolsa") ||
                   document.querySelector(".botones .bolsa") ||
                   null;

  const panel = document.getElementById("carrito-panel");
  const overlay = document.getElementById("overlay-carrito");
  const cerrarCarrito = document.getElementById("cerrar-carrito");

  // Logs para debug (puedes quitar luego)
  console.log("[carrito] btnCarrito:", !!btnCarrito, "panel:", !!panel, "overlay:", !!overlay, "cerrar:", !!cerrarCarrito);

  // Si no hay panel u overlay, no tiene sentido continuar, pero no retornamos
  if (!panel) {
    console.warn("[carrito] No se encontró #carrito-panel en el DOM. Los listeners no se aplicarán.");
    return;
  }
  if (!overlay) {
    console.warn("[carrito] No se encontró #overlay-carrito en el DOM. El cierre por click fuera no funcionará.");
  }

  // Funciones para abrir y cerrar panel (reusables)
  function abrirPanel() {
    panel.classList.add("activo");
    if (overlay) overlay.classList.add("activo");
    panel.style.animation = "slideIn 0.35s ease-out";
  }

  function cerrarPanel() {
    panel.classList.remove("activo");
    if (overlay) overlay.classList.remove("activo");
  }

  // Si existe un botón del carrito, le ponemos el listener para abrir
  if (btnCarrito) {
    // El ícono del carrito puede contener un <a> o una imagen; evitamos comportamiento por defecto
    btnCarrito.addEventListener("click", (e) => {
      e.preventDefault();
      abrirPanel();
    });
  } else {
    // No se encontró el botón del carrito: quizá tu HTML usa otra estructura.
    // Dejar log para que puedas ajustarlo.
    console.warn("[carrito] No se encontró un selector para abrir el carrito (buscado #btn-carrito o .bolsa).");
  }

  // Listener para el botón de cerrar (si existe)
  if (cerrarCarrito) {
    cerrarCarrito.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarPanel();
    });
  } else {
    console.warn("[carrito] No se encontró #cerrar-carrito en el DOM.");
  }

  // Cerrar al pulsar overlay (si existe)
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarPanel();
    });
  }

  // También cerramos con Escape por robustez
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarPanel();
  });
});



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
    if (panel) panel.style.animation = 'slideIn 0.45s cubic-bezier(0.25, 1, 0.3, 1)';
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

// =========================
// Buscador: modal + lógica
// =========================
(function () {
  const lupa = document.querySelector('.iconos img[alt="Buscar"]') || document.querySelector('.iconos img[src*="lupa"]') || document.querySelector('.icono img[alt="icono"]');
  const modal = document.getElementById('busqueda-modal');
  const cerrarBtn = document.getElementById('cerrarBusqueda');
  const input = document.getElementById('inputBusqueda');
  const resultados = document.getElementById('resultadosBusqueda');

  if (!modal || !input || !resultados) return; // nada que hacer si faltan elementos

  function abrirModal() {
    modal.classList.add('activo');
    input.value = '';
    resultados.innerHTML = '';
    setTimeout(() => input.focus(), 120);
  }

  function cerrarModal() {
    modal.classList.remove('activo');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    resultados.innerHTML = '';
    resultados.classList.remove('activo');
  }

  if (lupa) {
    lupa.closest('a')?.addEventListener('click', (e) => { e.preventDefault(); abrirModal(); });
    lupa.addEventListener && lupa.addEventListener('click', (e) => { e.preventDefault(); abrirModal(); });
  }

  if (cerrarBtn) cerrarBtn.addEventListener('click', cerrarModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  // Inicialización de productos si no existen
  if (!localStorage.getItem('productos')) {
    const productosIniciales = [
      { nombre: "Audífonos Strapped Air", precio: 160000, imagen: "Air2.png", url: "Tecnologia.html" },
      { nombre: "Cargador iPhone 25W", precio: 80000, imagen: "Cargador.png", url: "Tecnologia.html" },
      { nombre: "Apple Watch", precio: 450000, imagen: "Reloj.png", url: "Relojes.html" },
      { nombre: "Reloj Digital STRAPPED", precio: 200000, imagen: "Reloj2.png", url: "Relojes.html" },
      { nombre: "Bolso de Cuero STRAPPED", precio: 150000, imagen: "Bolsos.jpg", url: "Bolsos.html" }
    ];
    localStorage.setItem('productos', JSON.stringify(productosIniciales));
  }

  // ===== lógica de búsqueda =====
  const todosProductos = JSON.parse(localStorage.getItem('productos')) || [];

  input.addEventListener('input', () => {
    const termino = input.value.toLowerCase().trim();
    resultados.innerHTML = '';

    if (!termino) {
      resultados.classList.remove('activo');
      return;
    }

    resultados.classList.add('activo');

    const coincidencias = todosProductos.filter(p =>
      (p.nombre || '').toLowerCase().includes(termino)
    );

    if (coincidencias.length === 0) {
      resultados.innerHTML = '<p style="padding:12px;text-align:center;color:#333;">No se encontraron productos.</p>';
      return;
    }

    // Mostrar solo los primeros 4 productos
    const visibles = coincidencias.slice(0, 4);

    visibles.forEach(p => {
      const item = document.createElement('div');
      item.className = 'resultado-item';
      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h4>${p.nombre}</h4>
        <p>$${Number(p.precio).toLocaleString()}</p>
      `;
      item.addEventListener('click', () => {
        if (p.url) window.location.href = p.url;
      });
      resultados.appendChild(item);
    });

    if (coincidencias.length > 4) {
      const verTodos = document.createElement('button');
      verTodos.textContent = 'Ver todos los resultados';
      verTodos.className = 'btn-ver-todos';
      verTodos.style.cssText = `
        grid-column: 1 / -1;
        padding: 12px 18px;
        background: #000;
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.3s ease;
      `;
      verTodos.addEventListener('mouseenter', () => verTodos.style.background = '#333');
      verTodos.addEventListener('mouseleave', () => verTodos.style.background = '#000');

      verTodos.addEventListener('click', () => {
        resultados.innerHTML = '';
        coincidencias.forEach(p => {
          const item = document.createElement('div');
          item.className = 'resultado-item';
          item.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}">
            <h4>${p.nombre}</h4>
            <p>$${Number(p.precio).toLocaleString()}</p>
          `;
          item.addEventListener('click', () => {
            if (p.url) window.location.href = p.url;
          });
          resultados.appendChild(item);
        });
      });

      resultados.appendChild(verTodos);
    }
  });

  // Cerrar buscador al hacer clic fuera del área
  document.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && !e.target.closest('.iconos')) {
      if (modal.classList.contains('activo')) modal.classList.remove('activo');
    }
  });

})(); // fin IIFE buscador
