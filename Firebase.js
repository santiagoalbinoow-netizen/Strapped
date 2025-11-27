// CÓDIGO CORREGIDO (Cambia '11.0.1' por '9')
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ...

const firebaseConfig = {
  apiKey: "AIzaSyAyJoZxoKjKvchUYow6Y3FhEhbwN1uJ5hw",
  authDomain: "strapped-5c9b8.firebaseapp.com",
  projectId: "strapped-5c9b8",
  storageBucket: "strapped-5c9b8.firebasestorage.app",
  messagingSenderId: "1038047383752",
  appId: "1:1038047383752:web:530482f270625a137d95fd",
  measurementId: "G-YC6P9NYRYM"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
