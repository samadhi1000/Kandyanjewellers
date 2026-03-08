/* =====================================================
   KANDYAN GEM & JEWELLERS — Firebase Initialization
   ===================================================== */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA46qfKcYe3D39_jhhmhRTliRUeToToRus",
    authDomain: "kandyan-jewellers.firebaseapp.com",
    projectId: "kandyan-jewellers",
    storageBucket: "kandyan-jewellers.firebasestorage.app",
    messagingSenderId: "813712392733",
    appId: "1:813712392733:web:679f25ef0901ef01b7bcf4",
    measurementId: "G-5M8ZG8EMV3"
};

// Initialize helper (called from HTML files)
const FB = {
    db: null,
    auth: null,
    storage: null,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.storage = firebase.storage();
        this.isInitialized = true;
        console.log("🔥 Firebase Initialized");
    },

    // Database helpers
    async getProducts() {
        const snapshot = await this.db.collection("products").orderBy("name").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getSettings() {
        const doc = await this.db.collection("settings").doc("global").get();
        return doc.exists ? doc.data() : null;
    },

    async saveSettings(settings) {
        await this.db.collection("settings").doc("global").set(settings);
    },

    // Real-time synchronization
    listenProducts(callback) {
        return this.db.collection("products").orderBy("name").onSnapshot(snapshot => {
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(products);
        }, error => console.error("Error listening to products:", error));
    },

    listenSettings(callback) {
        return this.db.collection("settings").doc("global").onSnapshot(doc => {
            if (doc.exists) callback(doc.data());
        }, error => console.error("Error listening to settings:", error));
    },

    listenOrders(callback) {
        return this.db.collection("orders").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(orders);
        }, error => console.error("Error listening to orders:", error));
    },

    listenActivity(limit, callback) {
        return this.db.collection("activity").orderBy("timestamp", "desc").limit(limit).onSnapshot(snapshot => {
            const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(logs);
        }, error => console.error("Error listening to activity:", error));
    },

    async addOrder(order) {
        order.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const docRef = await this.db.collection("orders").add(order);
        return docRef.id;
    },

    // User & Role helpers
    async getUserProfile(uid) {
        const doc = await this.db.collection("users").doc(uid).get();
        return doc.exists ? doc.data() : null;
    },

    async saveUser(uid, data) {
        await this.db.collection("users").doc(uid).set(data, { merge: true });
    },

    async getAllUsers() {
        const snapshot = await this.db.collection("users").get();
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    },

    // Storage helpers
    async uploadFile(file, path) {
        const ref = this.storage.ref().child(path);
        const snapshot = await ref.put(file);
        return await ref.getDownloadURL();
    },

    async addActivity(log) {
        log.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        log.adminId = sessionStorage.getItem('kgj_admin_uid') || 'unknown';
        log.adminName = sessionStorage.getItem('kgj_admin_name') || 'System';
        await this.db.collection("activity").add(log);
    },

    async getActivity(limit = 10) {
        const snapshot = await this.db.collection("activity").orderBy("timestamp", "desc").limit(limit).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

window.FB = FB;
