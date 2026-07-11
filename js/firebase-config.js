// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  projectId: "kandyan-jewellers",
  appId: "1:813712392733:web:679f25ef0901ef01b7bcf4",
  storageBucket: "kandyan-jewellers.firebasestorage.app",
  apiKey: "AIzaSyA46qfKcYe3D39_jhhmhRTliRUeToToRus",
  authDomain: "kandyan-jewellers.firebaseapp.com",
  messagingSenderId: "813712392733",
  measurementId: "G-5M8ZG8EMV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
