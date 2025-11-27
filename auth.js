// ============================
//  IMPORTS FIREBASE
// ============================
import { auth, db } from "./Firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


// ============================
//  FUNCIONES PARA ABRIR/CERRAR MODAL
// ============================
function openLoginModal() {
  const authModal = document.getElementById("authModal");
  if (authModal) authModal.style.display = "flex";
}

function closeAuthModal() {
  const authModal = document.getElementById("authModal");
  if (authModal) authModal.style.display = "none";
}

function mensajeErrorFirebase(err) {
  const code =
    err.code ||
    err.customData?.code ||
    err.customData?._tokenResponse?.error?.message?.toLowerCase() ||
    "default";

  const mensajes = {
    "auth/invalid-email": "El correo no es válido.",
    "auth/missing-password": "Debes ingresar una contraseña.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta con este correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "default": "Ha ocurrido un error. Intenta nuevamente."
  };

  return mensajes[code] || mensajes["default"];
}

window.openLoginModal = openLoginModal;
window.closeAuthModal = closeAuthModal;


// ============================
//  EVENTOS DEL MODAL
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

  // ---------- Abrir modal ----------
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

  // ---------- Cerrar modal ----------
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

  // ---------------- REGISTER ----------------
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = registerForm["nombre"].value;
      const email = registerForm["email"].value;
      const password = registerForm["password"].value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
          nombre,
          email,
          creado: Date.now(),
        });

        closeAuthModal();
        location.reload();

      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: mensajeErrorFirebase(err),
          confirmButtonText: "Entendido",
          background: "#111",
          color: "#fff",
          confirmButtonColor: "#ff5a5a"
        });
      }
    });
  }

  // ---------------- LOGIN ----------------
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm["email"].value;
      const password = loginForm["password"].value;

      try {
        await signInWithEmailAndPassword(auth, email, password);

        closeAuthModal();
        location.reload();

      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: mensajeErrorFirebase(err),
          confirmButtonText: "Entendido",
          background: "#111",
          color: "#fff",
          confirmButtonColor: "#ff5a5a"
        });
      }
    });
  }
});



// ============================
//  DETECTAR SESIÓN ACTIVA
// ============================
onAuthStateChanged(auth, async (user) => {
  const panel = document.getElementById("panel-usuario");
  if (!panel) return;

  if (user) {
    await crearPerfilUsuario(user);
    let nombreUsuario = "";

    try {
      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      nombreUsuario = snap.exists() ? snap.data().nombre : user.displayName;
    } catch (err) {
      nombreUsuario = user.email.split("@")[0];
    }

    panel.innerHTML = `
      <div class="usuario-dropdown">
        <button type="button" class="usuario-btn">
          <img src="user.png" alt="UsuarioLog" class="icono-user">
          <div class="textos">
            <span class="hola">¡Hola!</span>
            <span class="correo">${nombreUsuario}</span>
          </div>
        </button>

        <div class="menu-usuario">
          <p class="titulo-menu">Mi Cuenta</p><hr>
          <a href="Perfil.html" class="opcion-menu">Perfil</a>
          <a href="#" id="goPedidos" class="opcion-menu">Mis pedidos</a>
          <button id="logoutBtn" class="opcion-menu logout">Cerrar Sesión</button>
        </div>
      </div>
    `;

    document.getElementById("logoutBtn").onclick = () => signOut(auth);

    document.querySelector(".usuario-btn").onclick = () => {
      document.querySelector(".menu-usuario").classList.toggle("activo");
    };

  } else {
    panel.innerHTML = `
      <button type="button" onclick="openLoginModal()">
          <img src="User.png" alt="UsuarioLog" class="icono-user">
      </button>
    `;
  }

  const goPedidos = document.getElementById("goPedidos");

if (goPedidos) {
  goPedidos.addEventListener("click", (e) => {
    if (window.location.pathname.includes("Perfil.html")) {
      e.preventDefault();

      // Cambiar sección
      const secciones = document.querySelectorAll(".perfil-section");
      secciones.forEach(sec => sec.classList.add("hidden"));

      const pedidosSec = document.getElementById("pedidos");
      pedidosSec.classList.remove("hidden");

      // Marcar el botón activo
      const btnPedidos = document.querySelector('.perfil-btn[data-section="pedidos"]');
      if (btnPedidos) {
        document.querySelectorAll(".perfil-btn").forEach(b => b.classList.remove("active"));
        btnPedidos.classList.add("active");
      }

      return;
    }

    // Navegar desde otra página
    window.location.href = "Perfil.html#pedidos";
  });

}

});


// ============================
//  GOOGLE LOGIN
// ============================
const googleBtn = document.getElementById("googleLogin");

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: user.displayName,
        email: user.email,
        creado: Date.now()
      }, { merge: true });

      window.closeAuthModal();
      setTimeout(() => location.reload(), 50);

    } catch (error) {
      console.error("FALLO en Google Login:", error);
    }
  });
}

// ===============================
//  🔹 Guardar datos de usuario en Firestore
// ===============================
export async function crearPerfilUsuario(user) {
  if (!user) return;

  const ref = doc(db, "usuarios", user.uid);

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      nombre: user.displayName || "",
      apellido: "",
      telefono: "",
      genero: "",
      nacimiento: "",
      cedula: "",
      favoritos: [],
      creadoEl: new Date()
    });
  }
}

// ===============================
//  🔹 Leer perfil del usuario
// ===============================
export async function obtenerPerfil(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ===============================
//  🔹 Actualizar perfil
// ===============================
export async function actualizarPerfil(uid, data) {
  const ref = doc(db, "usuarios", uid);
  await updateDoc(ref, data);

}
