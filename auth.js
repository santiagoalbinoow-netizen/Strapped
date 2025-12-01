// Variable global para apuntar a tu backend en Railway (Node.js)
const API_BASE_URL = 'https://strapped-backend.vercel.app';
// NOTA: Se eliminaron todos los imports de Firebase.

// ============================
// FUNCIONES PARA ABRIR/CERRAR MODAL
// ============================
function openLoginModal() {
    const authModal = document.getElementById("authModal");
    if (authModal) authModal.style.display = "flex";
}

function closeAuthModal() {
    const authModal = document.getElementById("authModal");
    if (authModal) authModal.style.display = "none";
}

// Ya no es necesaria la función mensajeErrorFirebase.
// La dejamos como estaba en tu último código, pero no se usará.
// Solo es para que el editor de código no te marque error en el bloque de código que ya tenías.
function mensajeErrorDummy(err) {
    const defaultMsg = "Ha ocurrido un error. Intenta nuevamente.";
    const code = err.code || "default";

    const mensajes = {
        "auth/invalid-email": "El correo no es válido.",
        "default": "Ha ocurrido un error. Intenta nuevamente."
    };

    return mensajes[code] || defaultMsg;
}

window.openLoginModal = openLoginModal;
window.closeAuthModal = closeAuthModal;

// ============================
// FUNCIÓN CENTRAL DE LOGIN (maneja la respuesta del Backend)
// ============================
async function handleLogin(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        // LOGIN EXITOSO - Guardar el JWT y la información del usuario
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.nombre);
        localStorage.setItem('userRole', data.rol);

        closeAuthModal();
        location.reload();
    } else {
        // Login Fallido - Usamos el error que viene del backend
        Swal.fire({
            icon: "error",
            title: "Error de Login",
            text: data.error || "Correo o contraseña incorrectos.",
            confirmButtonText: "Entendido",
            background: "#111",
            color: "#fff",
            confirmButtonColor: "#ff5a5a"
        });
    }
}

// ============================
// EVENTOS DEL MODAL
// ============================
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("authModal");
    const openBtn = document.getElementById("openLogin");
    const mobileLogin = document.getElementById("loginBtn");
    const closeBtn = document.getElementById("closeModal");

    const loginToggle = document.getElementById("loginToggle");
    const registerToggle = document.getElementById("registerToggle");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // ---------- Abrir/Cerrar Modal ----------
    if (openBtn) {
        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openLoginModal();
        });
    }
    if (mobileLogin) {
        mobileLogin.addEventListener("click", (e) => {
            e.preventDefault();
            openLoginModal();
            const menuCheckbox = document.getElementById("menu");
            if (menuCheckbox) menuCheckbox.checked = false;
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", () => closeAuthModal());
    }
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeAuthModal();
    });

    // ---------- Toggle LOGIN ↔ REGISTER ----------
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

    // ---------------- REGISTER (LLAMA AL BACKEND) ----------------
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = registerForm["nombre"].value;
            const email = registerForm["email"].value;
            const password = registerForm["password"].value;

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Registro exitoso, ahora iniciamos sesión automáticamente
                    await handleLogin(email, password);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error de Registro",
                        text: data.error || "Error al crear cuenta. Intenta más tarde.",
                        confirmButtonText: "Entendido",
                        background: "#111",
                        color: "#fff",
                        confirmButtonColor: "#ff5a5a"
                    });
                }

            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Error de conexión con el servidor.",
                    confirmButtonText: "Entendido",
                    background: "#111",
                    color: "#fff",
                    confirmButtonColor: "#ff5a5a"
                });
            }
        });
    }

    // ---------------- LOGIN (LLAMA AL BACKEND) ----------------
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm["email"].value;
            const password = loginForm["password"].value;

            try {
                await handleLogin(email, password);
            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Error de conexión con el servidor.",
                    confirmButtonText: "Entendido",
                    background: "#111",
                    color: "#fff",
                    confirmButtonColor: "#ff5a5a"
                });
            }
        });
    }

    // Se elimina el código de Google Login.
});


// ============================
// DETECTAR SESIÓN ACTIVA (USANDO JWT Y LOCALSTORAGE)
// ============================
function checkSession() {
    const token = localStorage.getItem('jwtToken');
    const panel = document.getElementById("panel-usuario");
    if (!panel) return;
    
    // Obtener la información guardada
    const nombreUsuario = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');


    if (token) {
        // Si hay token, mostramos el menú de usuario
        panel.innerHTML = `
            <div class="usuario-dropdown">
                <button type="button" class="usuario-btn">
                    <img src="imagenes/User.png" alt="UsuarioLog" class="icono-user">
                </button>

                <div class="menu-usuario">
                    <div class="textos">
                        <span class="correo">${nombreUsuario}</span>
                        <span class="rol">${userRole}</span> 
                    </div><hr>
                    <a href="Perfil.html" class="opcion-menu">Perfil</a>
                    ${userRole === 'admin' ? '<a href="AdminPanel.html" class="opcion-menu">Panel Admin</a>' : ''} 
                    <a href="#" id="goPedidos" class="opcion-menu">Mis pedidos</a>
                    <button id="logoutBtn" class="opcion-menu logout">Cerrar Sesión</button>
                </div>
            </div>
        `;

        // Lógica de Cerrar Sesión (elimina JWT)
        document.getElementById("logoutBtn").onclick = () => {
            localStorage.clear(); // Elimina el token y la info
            location.reload();    // Recarga la página
        };

        // Lógica para abrir/cerrar menú de usuario
        document.querySelector(".usuario-btn").onclick = () => {
            document.querySelector(".menu-usuario").classList.toggle("activo");
        };

    } else {
        // Si no hay token, mostramos el botón de login
        panel.innerHTML = `
            <button type="button" class="usuario-btn" onclick="openLoginModal()">
                <img src="imagenes/User.png" class="icono-user">
            </button>
        `;
    }

    // Lógica para ir a pedidos
    const goPedidos = document.getElementById("goPedidos");
    if (goPedidos) {
      goPedidos.addEventListener("click", (e) => {
        const enPerfil = window.location.pathname.includes("Perfil.html");

        if (enPerfil) {
            e.preventDefault();
            // Esto asume que Perfil.html tiene la lógica para cambiar secciones
            document.dispatchEvent(new CustomEvent("abrirPedidos")); 
        } else {
            // Ir al perfil con hash
            window.location.href = "Perfil.html#pedidos";
        }
      });
    }
}

// Llamamos a la nueva función al cargar el DOM
document.addEventListener("DOMContentLoaded", checkSession);

// Se eliminan todas las funciones y lógica de Firestore.


