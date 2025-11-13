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
  checkoutBtn.addEventListener('click', () => {
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

// =========================
// 🔹 Cambio de color del header al hacer scroll (usa clase .scrolled)
//    - Implementación robusta: manipulamos directamente el style del <img>
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const iconoImg = document.querySelector('.icono img'); // selecciona la imagen dentro del .icono
  if (!header) return;

  function actualizarHeader() {
    const banner = document.querySelector('.banner') || document.querySelector('.hero');
    const alturaBanner = banner ? banner.offsetHeight : 300;

    if (window.scrollY > alturaBanner - 50) {
      // header blanco
      header.classList.add('scrolled');
      if (iconoImg) {
        // quitamos cualquier filtro — mostramos la imagen original (normalmente negra)
        iconoImg.style.transition = 'filter 0.25s ease';
        iconoImg.style.filter = 'none';
        // si tu CSS aplica !important u otro filtro, este style inline lo gana
      }
    } else {
      // header oscuro
      header.classList.remove('scrolled');
      if (iconoImg) {
        // forzamos que se vea blanco arriba (sobre banner oscuro)
        iconoImg.style.transition = 'filter 0.25s ease';
        iconoImg.style.filter = 'invert(1)'; // hace visible icono negro -> blanco
      }
    }
  }

  // Ejecutar al cargar y en scroll y resize
  actualizarHeader();
  window.addEventListener('scroll', actualizarHeader);
  window.addEventListener('resize', actualizarHeader);
});

// =========================
// 🔹 Panel de botones responsive (versión corregida)
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const iconoBtn = document.querySelector('.icono');
  const panelBotones = document.getElementById('botones-panel');
  if (!iconoBtn || !panelBotones) return;

  // Mover panel al body si está dentro del header
  if (panelBotones.parentNode !== document.body) {
    document.body.appendChild(panelBotones);
  }

  // Crear overlay si no existe
  let overlayMenu = document.querySelector('.overlay-menu');
  if (!overlayMenu) {
    overlayMenu = document.createElement('div');
    overlayMenu.classList.add('overlay-menu');
    document.body.appendChild(overlayMenu);
  }

  // Llenar menú si está vacío
  if (panelBotones.innerHTML.trim() === '') {
    panelBotones.innerHTML = `
      <ul class="menu-lista">
        <li>
          <a href="#">Tecnología <span class="flecha">›</span></a>
          <ul class="submenu">
            <li><a href="#">Audífonos</a></li>
            <li><a href="#">Parlantes</a></li>
            <li><a href="#">Cargadores</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Relojes <span class="flecha">›</span></a>
          <ul class="submenu">
            <li><a href="#">Digitales</a></li>
            <li><a href="#">Análogos</a></li>
          </ul>
        </li>
        <li>
          <a href="#">Bolsos y Carrieles <span class="flecha">›</span></a>
          <ul class="submenu">
            <li><a href="#">Cuero</a></li>
            <li><a href="#">De viaje</a></li>
          </ul>
        </li>
        <li><a href="#">Ofertas</a></li>
        <li class="login-mobile"><a href="#" id="loginBtnMenu">Iniciar Sesión / Registrarse</a></li>
      </ul>
    `;
  }

  // === Funciones ===
  function abrirPanel() {
    panelBotones.classList.add('activo');
    overlayMenu.classList.add('activo');
    document.documentElement.style.overflow = 'hidden';
  }

  function cerrarPanel() {
    panelBotones.classList.remove('activo');
    overlayMenu.classList.remove('activo');
    document.documentElement.style.overflow = '';
  }

  // === Eventos ===

  // Abrir panel
  iconoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    abrirPanel();
  });

  // Cerrar con overlay o tecla ESC
  overlayMenu.addEventListener('click', cerrarPanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarPanel();
  });

  // Evitar cierre al hacer clic dentro del panel y manejar submenús
  panelBotones.addEventListener('click', (e) => {
    e.stopPropagation();

    const link = e.target.closest('a');
    if (!link) return;
      // Si es el botón de login móvil, abre modal y cierra el panel
    if (link.id === 'loginBtnMenu') {
    e.preventDefault();
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
    cerrarPanel(); // ✅ solo aquí se cierra el menú
    return;
    }

    // Toggle submenús
    const submenu = link.nextElementSibling;
    if (submenu && submenu.classList.contains('submenu')) {
      e.preventDefault();
      link.parentElement.classList.toggle('activo');
      return;
    }

    // Abrir modal de login si aplica
    if (link.id === 'loginBtnMenu') {
      e.preventDefault();
      const modal = document.getElementById('authModal');
      if (modal) modal.style.display = 'flex';
      return;
    }

    // Enlaces normales → dejar que naveguen
    // No cerramos el panel automáticamente
  });

  // Cerrar automáticamente si pasa a modo escritorio (>900px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) cerrarPanel();
  });
});

// ---------- Modal de búsqueda: apertura, cierre y bloqueo de scroll ----------
(function () {
  // selectores robustos para la lupa (atiende variantes)
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

  // abrir con la lupa (si existe)
  if (lupa) {
    lupa.closest('a')?.addEventListener('click', (e) => { e.preventDefault(); abrirModal(); });
    // si no está dentro de <a>, escuchar directamente
    lupa.addEventListener && lupa.addEventListener('click', (e) => { e.preventDefault(); abrirModal(); });
  }

  // cerrar por botón
  if (cerrarBtn) cerrarBtn.addEventListener('click', cerrarModal);

  // cerrar al clickear fuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
  });

  //Limpiar prductos

  //localStorage.removeItem("productos");

  // ---------- Inicialización de productos STRAPPED ----------
document.addEventListener('DOMContentLoaded', () => {
  // Si ya existen productos en localStorage, no se vuelven a crear
  if (!localStorage.getItem('productos')) {
    const productos = [
      {
        nombre: "Audífonos Strapped Air",
        precio: 160000,
        imagen: "imagenes/Air2.png",
        url: "Tecnologia.html"
      },
      {
        nombre: "Cargador iPhone 25W",
        precio: 80000,
        imagen: "imagenes/Cargador.png",
        url: "Tecnologia.html"
      },
      {
        nombre: "Apple Watch",
        precio: 450000,
        imagen: "imagenes/Reloj.png",
        url: "Relojes.html"
      },
      {
        nombre: "Reloj Digital STRAPPED",
        precio: 200000,
        imagen: "imagenes/Reloj2.png",
        url: "Relojes.html"
      },
      {
        nombre: "Bolso de Cuero STRAPPED",
        precio: 150000,
        imagen: "imagenes/Bolsos.jpg",
        url: "Bolsos.html"
      }
    ];

    localStorage.setItem('productos', JSON.stringify(productos));
  }
});


  // ---------- Lógica de búsqueda ----------
  const productos = JSON.parse(localStorage.getItem('productos')) || [];

  input.addEventListener('input', () => {
    const termino = input.value.toLowerCase().trim();
    resultados.innerHTML = '';

    if (!termino) {
      resultados.classList.remove('activo');
      return;
    }

    resultados.classList.add('activo');

    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const coincidencias = productos.filter(p =>
      (p.nombre || '').toLowerCase().includes(termino)
    );

    if (coincidencias.length === 0) {
      resultados.innerHTML = '<p style="padding:12px;text-align:center;color:#333;">No se encontraron productos.</p>';
      return;
    }

    // 🔹 Mostrar solo los primeros 4 productos
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

    // 🔹 Si hay más de 4 resultados, mostrar botón “Ver todos”
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

    // construir resultados
    const frag = document.createDocumentFragment();
    matches.forEach(p => {
      const item = document.createElement('div');
      item.className = 'resultado-item';
      item.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <div>
          <h4 style="margin:0;">${p.nombre}</h4>
          <p style="margin:4px 0 0 0;">$${Number(p.precio).toLocaleString()}</p>
        </div>
      `;
      item.addEventListener('click', () => {
        // si tu producto tiene url definida la usamos, si no vamos a index
        if (p.url) window.location.href = p.url;
        else window.location.href = 'index.html';
      });
      frag.appendChild(item);
    });
    resultados.appendChild(frag);
  });
})();

// Cerrar buscador al hacer clic fuera del área
document.addEventListener('click', (e) => {
  const modal = document.getElementById('busqueda-modal');
  const inputContainer = document.querySelector('.container-input');

  if (modal.classList.contains('activo') && !inputContainer.contains(e.target) && !e.target.closest('.iconos')) {
    modal.classList.remove('activo');
  }
});
