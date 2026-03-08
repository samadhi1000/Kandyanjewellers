/* =====================================================
   KANDYAN GEM & JEWELLERS — Data Store (Firebase & LocalStorage)
   ===================================================== */

const KGJ = {

  /* ── Keys (Fallback) ── */
  KEYS: {
    products: 'kgj_products',
    orders: 'kgj_orders',
    settings: 'kgj_settings',
    wishlist: 'kgj_wishlist',
    admin: 'kgj_admin',
  },

  /* ── Cache ── */
  _cache: {
    products: [],
    settings: null,
    initialized: false
  },

  /* ── Currency ── */
  currency: 'Rs.',

  fmt(amount) {
    return `${this.currency} ${Number(amount).toLocaleString('en-LK')}`;
  },

  /* ── INIT ── */
  async init(onUpdate = null) {
    if (this._cache.initialized) return;

    if (window.FB) {
      try {
        FB.init();

        let initialProductsResolve, initialSettingsResolve;
        const initialProductsPromise = new Promise(r => initialProductsResolve = r);
        const initialSettingsPromise = new Promise(r => initialSettingsResolve = r);

        // Listen for products
        FB.listenProducts(products => {
          this._cache.products = products || [];
          localStorage.setItem(this.KEYS.products, JSON.stringify(products));
          if (this._cache.initialized && onUpdate) onUpdate('products');
          initialProductsResolve();
        });

        // Listen for settings
        FB.listenSettings(settings => {
          if (settings) {
            this._cache.settings = settings;
            localStorage.setItem(this.KEYS.settings, JSON.stringify(settings));
            if (this._cache.initialized && onUpdate) onUpdate('settings');
          }
          initialSettingsResolve();
        });

        // Wait up to 3 seconds for initial fetch (in case offline)
        const timeout = new Promise(r => setTimeout(r, 3000));
        await Promise.race([
          Promise.all([initialProductsPromise, initialSettingsPromise]),
          timeout
        ]);

        console.log("💎 KGJ Data Loaded from Firebase (Real-time sync active)");
      } catch (e) {
        console.error("❌ Firebase Load Failed, falling back to LocalStorage:", e);
      }
    }

    // Fallback/Seed if empty
    if (!this._cache.products.length) {
      let raw = localStorage.getItem(this.KEYS.products);
      if (!raw) {
        this._seed();
        raw = localStorage.getItem(this.KEYS.products);
      }
      this._cache.products = JSON.parse(raw) || [];
    }

    this._cache.initialized = true;
  },

  /* ── Products ── */
  getProducts() {
    return this._cache.products;
  },

  async saveProducts(products) {
    this._cache.products = products;
    localStorage.setItem(this.KEYS.products, JSON.stringify(products));

    if (window.FB) {
      // Sync to Firestore (requires individual doc updates normally, but we keep it simple for now)
      for (const p of products) {
        await FB.db.collection("products").doc(p.id).set(p);
      }
    }
  },

  getProduct(id) {
    return this.getProducts().find(p => p.id === id) || null;
  },

  async addProduct(product) {
    product.id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    product.createdAt = new Date().toISOString();

    const products = this.getProducts();
    products.unshift(product);
    this._cache.products = products;

    if (window.FB) {
      await FB.db.collection("products").doc(product.id).set(product);
      await FB.addActivity({ action: 'add_product', details: `Added product: ${product.name}`, productId: product.id });
    }

    localStorage.setItem(this.KEYS.products, JSON.stringify(products));
    return product;
  },

  async updateProduct(id, data) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;

    products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
    this._cache.products = products;

    if (window.FB) {
      // Use set with merge: true instead of update. 
      // This fixes the error where seed/local products don't exist in Firestore yet.
      await FB.db.collection("products").doc(id).set(products[idx], { merge: true });
      const name = data.name || products[idx].name;
      await FB.addActivity({ action: 'edit_product', details: `Updated product: ${name}`, productId: id });
    }

    localStorage.setItem(this.KEYS.products, JSON.stringify(products));
    return products[idx];
  },

  async deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this._cache.products = products;

    if (window.FB) {
      await FB.db.collection("products").doc(id).delete();
      await FB.addActivity({ action: 'delete_product', details: `Deleted product ID: ${id}` });
    }

    localStorage.setItem(this.KEYS.products, JSON.stringify(products));
  },

  getFeatured() {
    return this.getProducts().filter(p => p.featured && p.inStock);
  },

  getByCategory(cat) {
    if (!cat || cat === 'all') return this.getProducts().filter(p => p.inStock);
    return this.getProducts().filter(p => p.category === cat && p.inStock);
  },

  getCategories() {
    const products = this.getProducts();
    return [...new Set(products.map(p => p.category))];
  },

  searchProducts(query) {
    const q = query.toLowerCase();
    return this.getProducts().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.gemstone && p.gemstone.toLowerCase().includes(q))
    );
  },

  /* ── Orders ── */
  async getOrders() {
    if (window.FB) {
      const snapshot = await FB.db.collection("orders").orderBy("createdAt", "desc").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return JSON.parse(localStorage.getItem(this.KEYS.orders) || '[]');
  },

  async saveOrder(order) {
    order.id = 'ORD-' + Date.now().toString(36).toUpperCase();
    order.status = 'pending';

    if (window.FB) {
      order.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      const docRef = await FB.db.collection("orders").add(order);
      order.id = docRef.id;
    } else {
      order.createdAt = new Date().toISOString();
      const orders = JSON.parse(localStorage.getItem(this.KEYS.orders) || '[]');
      orders.unshift(order);
      localStorage.setItem(this.KEYS.orders, JSON.stringify(orders));
    }

    return order;
  },

  async updateOrderStatus(id, status) {
    if (window.FB) {
      await FB.db.collection("orders").doc(id).update({
        status: status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      const orders = JSON.parse(localStorage.getItem(this.KEYS.orders) || '[]');
      const idx = orders.findIndex(o => o.id === id);
      if (idx !== -1) {
        orders[idx].status = status;
        orders[idx].updatedAt = new Date().toISOString();
        localStorage.setItem(this.KEYS.orders, JSON.stringify(orders));
      }
    }
  },

  /* ── Settings ── */
  getSettings() {
    const defaults = {
      siteName: 'Kandyan Gem & Jewellers',
      tagline: 'Timeless Kandyan Craftsmanship Since 1985',
      heroTitle: 'Where Every Gem Tells a Story',
      heroSubtitle: 'Handcrafted Kandyan jewellery of unparalleled quality',
      heroCtaText: 'Explore Collection',
      phone: '+94 81 234 5678',
      whatsapp: '+94 77 123 4567',
      email: 'info@kandyangemandjewellers.lk',
      address: 'No. 42, Peradeniya Road, Kandy 20000, Sri Lanka',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      heroBg: 'images/hero.jpg',
      gemsBg: 'images/gems-bg.jpg',
      aboutBg: 'images/about-bg.jpg',
      collectionBg: 'images/collection-banner.jpg',
      offerBanner: 'Free shipping on orders over Rs. 15,000 | Certified Authentic Gems | 30-Day Returns',
      deliveryCharge: 350,
      codAvailable: true,
      cardAvailable: true,
    };

    const saved = this._cache.settings || JSON.parse(localStorage.getItem(this.KEYS.settings) || '{}');
    return { ...defaults, ...saved };
  },

  async saveSettings(settings) {
    this._cache.settings = settings;
    localStorage.setItem(this.KEYS.settings, JSON.stringify(settings));
    if (window.FB) {
      await FB.saveSettings(settings);
      await FB.addActivity({ action: 'update_settings', details: 'Updated site settings' });
    }
  },

  /* ── Wishlist ── */
  getWishlist() {
    return JSON.parse(localStorage.getItem(this.KEYS.wishlist) || '[]');
  },

  toggleWishlist(productId) {
    const list = this.getWishlist();
    const idx = list.indexOf(productId);
    if (idx === -1) list.push(productId);
    else list.splice(idx, 1);
    localStorage.setItem(this.KEYS.wishlist, JSON.stringify(list));
    return idx === -1;
  },

  isWishlisted(productId) {
    return this.getWishlist().includes(productId);
  },

  /* ── Admin Auth ── */
  isAdminLoggedIn() {
    return !!sessionStorage.getItem('kgj_admin_uid');
  },

  getUserRole() {
    return sessionStorage.getItem('kgj_admin_role') || 'editor';
  },

  async adminLogin(email, password) {
    if (!window.FB) return false;
    try {
      const res = await FB.auth.signInWithEmailAndPassword(email, password);
      const profile = await FB.getUserProfile(res.user.uid);

      sessionStorage.setItem('kgj_admin_uid', res.user.uid);
      sessionStorage.setItem('kgj_admin_role', profile?.role || 'editor');
      sessionStorage.setItem('kgj_admin_name', profile?.name || email.split('@')[0]);

      return true;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  },

  adminLogout() {
    sessionStorage.removeItem('kgj_admin_uid');
    sessionStorage.removeItem('kgj_admin_role');
    sessionStorage.removeItem('kgj_admin_name');
    if (window.FB) FB.auth.signOut();
  },

  /* ── Seed Data ── */
  _seed() {
    const products = [
      {
        id: 'p_seed_1', name: 'Royal Sapphire Ring', category: 'Rings',
        description: 'A breathtaking 3ct Ceylon Blue Sapphire set in 22k gold with intricate Kandyan filigree work. Certified by the National Gem and Jewellery Authority of Sri Lanka.',
        price: 185000, discountedPrice: 165000, specialOffer: 'Valentine Special',
        offerExpiry: '2026-04-30', images: ['images/hero.jpg'],
        metal: '22K Gold', gemstone: 'Ceylon Blue Sapphire', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '8.5g', rating: 4.9, reviews: 47
      },
      {
        id: 'p_seed_2', name: 'Ruby Pendant Necklace', category: 'Necklaces',
        description: 'Stunning Burmese ruby pendant set in 18k rose gold with diamond halo. Comes with a 22-inch rose gold chain.',
        price: 245000, discountedPrice: 245000, specialOffer: '',
        offerExpiry: '', images: ['images/collection-banner.jpg'],
        metal: '18K Rose Gold', gemstone: 'Burmese Ruby', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '12g', rating: 4.8, reviews: 31
      },
      {
        id: 'p_seed_3', name: 'Emerald Cascade Earrings', category: 'Earrings',
        description: 'Exquisite drop earrings featuring Colombian emeralds in a traditional Kandyan gold setting with hand-engraved lotus motifs.',
        price: 135000, discountedPrice: 118000, specialOffer: '12% Off',
        offerExpiry: '2026-05-15', images: ['images/gems-bg.jpg'],
        metal: '21K Gold', gemstone: 'Colombian Emerald', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '6.2g', rating: 4.7, reviews: 28
      },
      {
        id: 'p_seed_4', name: 'Kandyan Bridal Set', category: 'Bridal',
        description: 'Complete Kandyan bridal jewellery set including necklace, earrings, bangles, and maang tikka in 22k gold with rubies and pearls.',
        price: 850000, discountedPrice: 750000, specialOffer: 'Bridal Season Offer',
        offerExpiry: '2026-06-30', images: ['images/about-bg.jpg'],
        metal: '22K Gold', gemstone: 'Ruby & Pearl', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '85g', rating: 5.0, reviews: 15
      },
      {
        id: 'p_seed_5', name: 'Sapphire Tennis Bracelet', category: 'Bracelets',
        description: 'Elegant tennis bracelet with alternating Ceylon sapphires and white diamonds set in 18k white gold.',
        price: 195000, discountedPrice: 175000, specialOffer: '',
        offerExpiry: '', images: ['images/collection-banner.jpg'],
        metal: '18K White Gold', gemstone: 'Ceylon Sapphire & Diamond', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '15g', rating: 4.6, reviews: 22
      },
      {
        id: 'p_seed_6', name: 'Cat\'s Eye Gent Ring', category: 'Rings',
        description: 'Bold gentleman\'s ring featuring a prized Cat\'s Eye Chrysoberyl in a heavy 22k gold setting with traditional engravings.',
        price: 125000, discountedPrice: 125000, specialOffer: '',
        offerExpiry: '', images: ['images/gems-bg.jpg'],
        metal: '22K Gold', gemstone: "Cat's Eye Chrysoberyl", inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '18g', rating: 4.5, reviews: 19
      }
    ];
    this.saveProducts(products);
  },
};

window.KGJ = KGJ;
