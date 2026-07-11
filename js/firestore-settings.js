/* =====================================================
   KANDYAN GEM & JEWELLERS — Firestore Settings Module
   Syncs site configuration (hero, about, contact, etc.)
   across all devices in real-time.
   ===================================================== */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const _cfg = {
  projectId: "kandyan-jewellers",
  appId: "1:813712392733:web:679f25ef0901ef01b7bcf4",
  storageBucket: "kandyan-jewellers.firebasestorage.app",
  apiKey: "AIzaSyA46qfKcYe3D39_jhhmhRTliRUeToToRus",
  authDomain: "kandyan-jewellers.firebaseapp.com",
  messagingSenderId: "813712392733",
};

const _app = getApps().length ? getApp() : initializeApp(_cfg);
const _db = getFirestore(_app);
const SETTINGS_DOC = 'config/site_settings';

/**
 * Load settings from Firestore. 
 * If it doesn't exist, it will use localStorage defaults via store.js
 */
async function fsLoadSettings() {
  try {
    const docRef = doc(_db, SETTINGS_DOC);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      const data = snap.data();
      window._FSSettings = data;
      console.log('[KGJ] Settings loaded from Firestore');
      return data;
    } else {
      console.log('[KGJ] No settings in Firestore, using local defaults');
      // If Firestore is empty, we don't seed here to avoid overwriting 
      // the user's existing local changes if they are working on it.
      // The admin panel will seed it on first save.
      return null;
    }
  } catch (e) {
    console.error('[KGJ] Firestore settings load failed:', e);
    return null;
  }
}

/**
 * Save settings to Firestore.
 */
async function fsSaveSettings(settings) {
  try {
    const docRef = doc(_db, SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
    window._FSSettings = settings;
    console.log('[KGJ] Settings saved to Firestore');
    return true;
  } catch (e) {
    console.error('[KGJ] Firestore settings save failed:', e);
    throw e;
  }
}

/* ── Expose on window.KGJ ── */
window.KGJ = window.KGJ || {};
Object.assign(window.KGJ, {
  fsLoadSettings,
  fsSaveSettings
});
