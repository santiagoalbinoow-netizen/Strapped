// 1. Inicialización
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 2. Funciones de Utilidad (Actualizan el estado)
const guardarCarrito = () => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
    // Llama a la función que dibuja el carrito en el panel
    renderizarCarrito(); // <-- ¡NUEVA LLAMADA IMPORTANTE!
};

const actualizarContador = () => {
    const contador = document.getElementById("contador-carrito");
    // Se usa 'textContent' para mostrar el número de ítems
    contador.textContent = carrito.length;
};

// 3. Función de Renderizado (Dibuja el contenido en el panel)
// Modificar la función renderizarCarrito() en carrito.js

const renderizarCarrito = () => {
    const carritoBody = document.querySelector('.carrito-body');
    if (!carritoBody) return; 

    carritoBody.innerHTML = ''; 

    if (carrito.length === 0) {
        // Lógica para carrito vacío
        carritoBody.innerHTML = '<p>EL CARRITO ESTÁ VACÍO</p>';
        carritoBody.style.justifyContent = 'center'; 
        carritoBody.style.alignItems = 'center'; 
        carritoBody.style.display = 'flex'; 
    } else {
        // Lógica para carrito con productos
        carritoBody.style.display = 'block'; 
        carritoBody.style.justifyContent = 'initial'; 
        carritoBody.style.alignItems = 'initial'; 
        
        let htmlContenido = '';
        
        // Usamos el índice (i) en el bucle forEach
        carrito.forEach((producto, i) => {
            htmlContenido += `
                <div class="item-carrito">
                    <img src="${producto.imagen}" alt="${producto.nombre}"> 
                    <div>
                        <h4>${producto.nombre}</h4>
                        <p>Cantidad: ${producto.cantidad}</p>
                        <p>Precio: ${producto.precio}</p>
                    </div>
                    
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${i})">×</button>
                </div>
            `;
        });
        
        carritoBody.innerHTML = htmlContenido;
        
        // Añadir el botón de Checkout al final del carrito-body
        carritoBody.innerHTML += '<button class="btn" style="margin-top: 20px; width: 100%;">FINALIZAR COMPRA</button>';
        
    }
};

// 4. Función de Agregar (Mantiene tu lógica)
function agregarAlCarrito(producto) {
    // Aquí puedes añadir lógica para sumar la cantidad si el producto ya existe
    // Por ahora, solo agrega un nuevo objeto
    carrito.push(producto);
    guardarCarrito();
    // En un entorno de panel lateral, es mejor no usar alert()
    // Puedes usar una notificación temporal o simplemente la apertura del panel
}

// 5. Lógica de Detección del Botón (Mantiene tu lógica)
const botonAgregar = document.querySelector(".btn-secundario");

if (botonAgregar) {
    botonAgregar.addEventListener("click", () => {
        // ... (Tu código de captura de producto) ...
        const producto = {
            nombre: document.querySelector(".producto-info h1").textContent,
            // Captura el último precio (el no tachado)
            precio: document.querySelector(".precio").textContent.trim().split(' ').pop(), 
            cantidad: parseInt(document.getElementById("cantidad").value),
            imagen: document.querySelector(".producto-imagen img").src
        };
        agregarAlCarrito(producto);

        // Opcional: abre el panel del carrito automáticamente al agregar un producto
        document.getElementById('carrito-panel').classList.add('activo');
        document.getElementById('overlay-carrito').classList.add('activo');
    });
}

// 6. Ejecución Inicial
actualizarContador();
renderizarCarrito(); // Carga el contenido del carrito al iniciar la página

// --- Lógica de Botones de Cantidad (Añadir al final de carrito.js) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionar elementos clave
    const inputCantidad = document.getElementById('cantidad');
    const botonesCantidad = document.querySelectorAll('.btn-cantidad');

    // 2. Verificar que el input de cantidad exista en esta página
    if (!inputCantidad) {
        // Si no estamos en una página de producto (donde el input existe), salimos.
        return; 
    }

    // 3. Asignar el evento a cada botón
    botonesCantidad.forEach(boton => {
        boton.addEventListener('click', () => {
            // Aseguramos que la cantidad actual sea un número entero
            let cantidadActual = parseInt(inputCantidad.value);
            // Obtenemos el valor mínimo del input (debería ser 1)
            const min = parseInt(inputCantidad.min) || 1; 

            // Determinar si se hizo clic en '+' o '-'
            if (boton.textContent.trim() === '+') {
                cantidadActual++;
            } else if (boton.textContent.trim() === '-') {
                // Solo decrementa si la cantidad es mayor que el mínimo
                if (cantidadActual > min) {
                    cantidadActual--;
                }
            }

            // 4. Actualizar el valor del input
            inputCantidad.value = cantidadActual;
        });
    });
}); 

// Función para eliminar un producto por su índice en el array
function eliminarDelCarrito(index) {
    if (index > -1) {
        // Elimina 1 elemento en la posición 'index'
        carrito.splice(index, 1); 
        
        // Guarda el carrito actualizado en localStorage y vuelve a dibujar
        guardarCarrito();
    }
}

// === CARRUSEL UNIVERSAL (funciona en móvil y escritorio) ===
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
