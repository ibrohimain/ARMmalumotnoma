// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC402_NJ6_R21sUfKqoUosKL5Tpv4BdKlY",
  authDomain: "micro-elysium-478112-k7.firebaseapp.com",
  projectId: "micro-elysium-478112-k7",
  storageBucket: "micro-elysium-478112-k7.firebasestorage.app",
  messagingSenderId: "833457590044",
  appId: "1:833457590044:web:f275a838dfe94fd108b4d9",
  measurementId: "G-FCR2SE3QGZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);