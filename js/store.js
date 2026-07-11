/* =====================================================
   KANDYAN GEM & JEWELLERS — Data Store (localStorage)
   ===================================================== */

const KGJ = {

  /* ── Keys ── */
  KEYS: {
    products: 'kgj_products',
    orders: 'kgj_orders',
    settings: 'kgj_settings',
    wishlist: 'kgj_wishlist',
    admin: 'kgj_admin',
  },

  /* ── Currency ── */
  currency: 'Rs.',

  fmt(amount) {
    return `${this.currency} ${Number(amount).toLocaleString('en-LK')}`;
  },

  /* ── Products ── */
  getProducts() {
    // Check for Firestore cache first (populated by firestore-products.js)
    if (window._FSProducts && Array.isArray(window._FSProducts) && window._FSProducts.length > 0) {
      return window._FSProducts;
    }
    let raw = localStorage.getItem(this.KEYS.products);
    if (!raw) {
      this._seed();
      raw = localStorage.getItem(this.KEYS.products);
    }
    this._patchSeedImages();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch(e) {}
    return [];
  },

  async getProductsAsync() {
    if (this.fsLoadProducts) {
      const products = await this.fsLoadProducts();
      if (products && products.length > 0) return products;
    }
    return this.getProducts();
  },


  saveProducts(products) {
    localStorage.setItem(this.KEYS.products, JSON.stringify(products));
  },

  getProduct(id) {
    return this.getProducts().find(p => p.id === id) || null;
  },

  addProduct(product) {
    const products = this.getProducts();
    product.id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    product.createdAt = new Date().toISOString();
    products.unshift(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(id, data) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveProducts(products);
    return products[idx];
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
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
  getOrders() {
    return JSON.parse(localStorage.getItem(this.KEYS.orders) || '[]');
  },

  saveOrder(order) {
    const orders = this.getOrders();
    order.id = 'ORD-' + Date.now().toString(36).toUpperCase();
    order.createdAt = new Date().toISOString();
    order.status = 'pending';
    orders.unshift(order);
    localStorage.setItem(this.KEYS.orders, JSON.stringify(orders));
    return order;
  },

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(this.KEYS.orders, JSON.stringify(orders));
    }
  },

  /* ── Settings ── */
  getSettings() {
    const defaults = this.getSettingsDefaults();
    let settings = { ...defaults };

    // 1. Merge localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(this.KEYS.settings) || '{}');
      settings = { ...settings, ...saved };
    } catch(e) {}

    // 2. Merge Firestore cache
    if (window._FSSettings) {
      settings = { ...settings, ...window._FSSettings };
      // Safety: If Firestore has no artisans, keep defaults
      if (!settings.artisans || settings.artisans.length === 0) {
        settings.artisans = defaults.artisans;
      }
    }
    
    return settings;
  },

  async getSettingsAsync() {
    if (this.fsLoadSettings) {
      const settings = await this.fsLoadSettings();
      if (settings) return settings;
    }
    return this.getSettings();
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.settings, JSON.stringify(settings));
    // If we have a push method, use it (usually called by admin panel)
    if (this.fsSaveSettings) {
      this.fsSaveSettings(settings).catch(e => console.error(e));
    }
  },

  async saveSettingsAsync(settings) {
    this.saveSettings(settings); // update local
    if (this.fsSaveSettings) {
      await this.fsSaveSettings(settings);
    }
  },

  getSettingsDefaults() {
    return {
      siteName: 'Kandyan Gem & Jewellers',
      tagline: 'Timeless Kandyan Craftsmanship Since 1995',
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
      shopHeroBg: 'images/collection-banner.jpg',
      aboutHeroBg: 'images/collection-banner.jpg',
      collectionBg: 'images/collection-banner.jpg',
      heroBgPos: 'center',
      shopHeroBgPos: 'center',
      aboutHeroBgPos: 'center',

      // About Page Content
      aboutS1Sub: 'Founded in 1995',
      aboutS1Head: 'A Legacy Born in the Heart of Kandy',
      aboutS1P1: 'Founded by master jeweller Mr. H.M. Rajapaksha in 1995, Kandyan Gem & Jewellers began as a small workshop in the heart of Kandy — the cultural capital of Sri Lanka — with a commitment to preserving the ancient art of Kandyan jewellery craftsmanship.',
      aboutS1P2: 'Today, three generations later, we remain true to our founding principles: uncompromising quality, authentic craftsmanship, and an unwavering passion for the precious gems of Sri Lanka.',
      aboutStat1Val: '30+',
      aboutStat1Lbl: 'Years of Heritage',
      aboutStat2Val: '5K+',
      aboutStat2Lbl: 'Happy Customers',

      aboutS2Sub: 'The Art',
      aboutS2Head: 'Master Craftsmen — A Dying Art Preserved',
      aboutS2P1: 'Our team of fifth-generation Kandyan jewel smiths use the same hand tools and techniques passed down through centuries. From the delicate filigree work (thinly spun gold wire) to the intricate repoussé embossing, every piece is a testament to living heritage.',
      aboutS2P2: 'We combine these ancient techniques with modern gem-setting precision to create jewellery that is both timeless and wearable — pieces that become heirlooms.',
      aboutBullet1: 'Traditional Kandyan filigree and repousse techniques',
      aboutBullet2: 'Hand-engraved temple motifs and lotus patterns',
      aboutBullet3: 'Custom bespoke commissions accepted',

      aboutS3Sub: 'Trust & Authenticity',
      aboutS3Head: 'Certified. Authentic. Guaranteed.',
      aboutS3P1: 'Every gemstone sold is accompanied by an internationally recognised certificate of authenticity:',
      aboutCerts: [
          'Gemological Institute of America (GIA)',
          'National Gem & Jewellery Authority of Sri Lanka (NGJA)',
          'Gemological Institute of Colombo (GIC)'
      ],

      aboutCtaSub: 'Begin Your Journey',
      aboutCtaHead: 'Experience Kandyan Excellence',
      aboutCtaP1: 'Browse our collection of handcrafted jewellery or contact us for a bespoke commission.',

      artisans: [
        { name: 'H.M. Rajapaksha', role: 'Managing Director & Founder', icon: '👑', desc: 'Fifth-generation jewel smith with over 50 years of experience in Kandyan jewellery traditions.', image: '' },
        { name: 'Chamara Rajapaksha', role: 'Chief Executive Officer', icon: '💎', desc: 'Certified by GEMA, specialising in Sri Lankan sapphires, rubies, and cat\'s eye gems.', image: '' },
        { name: 'Dilini Rajapaksha', role: 'Director of Design', icon: '✨', desc: 'Brings contemporary Kandyan design to life, blending tradition with modern elegance.', image: '' },
        { name: 'R.M. Rajapaksha', role: 'Director of Operations', icon: '⚙️', desc: 'Ensuring the highest standards of quality and service across all our galleries.', image: '' }
      ],
    };
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
    return idx === -1; // true = added
  },

  isWishlisted(productId) {
    return this.getWishlist().includes(productId);
  },

  /* ── Admin Auth ── */
  getAdminCreds() {
    const raw = localStorage.getItem(this.KEYS.admin);
    if (!raw) return { username: 'admin', password: 'kandyan2024' };
    return JSON.parse(raw);
  },

  checkAdmin(username, password) {
    const creds = this.getAdminCreds();
    return creds.username === username && creds.password === password;
  },

  isAdminLoggedIn() {
    return sessionStorage.getItem('kgj_admin_auth') === 'true';
  },

  adminLogin(username, password) {
    if (this.checkAdmin(username, password)) {
      sessionStorage.setItem('kgj_admin_auth', 'true');
      return true;
    }
    return false;
  },

  adminLogout() {
    sessionStorage.removeItem('kgj_admin_auth');
  },

  /* ── Seed Data ── */
  _seed() {
    const products = [
      {
        id: 'p_seed_1', name: 'Royal Sapphire Ring', category: 'Rings',
        description: 'A breathtaking 3ct Ceylon Blue Sapphire set in 22k gold with intricate Kandyan filigree work. Certified by the National Gem and Jewellery Authority of Sri Lanka.',
        price: 185000, discountedPrice: 165000, specialOffer: 'Valentine Special',
        offerExpiry: '2026-04-30',
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'],
        metal: '22K Gold', gemstone: 'Ceylon Blue Sapphire', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '8.5g', rating: 4.9, reviews: 47
      },
      {
        id: 'p_seed_2', name: 'Ruby Pendant Necklace', category: 'Necklaces',
        description: 'Stunning Burmese ruby pendant set in 18k rose gold with diamond halo. Comes with a 22-inch rose gold chain.',
        price: 245000, discountedPrice: 245000, specialOffer: '',
        offerExpiry: '',
        images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80'],
        metal: '18K Rose Gold', gemstone: 'Burmese Ruby', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '12g', rating: 4.8, reviews: 31
      },
      {
        id: 'p_seed_3', name: 'Emerald Cascade Earrings', category: 'Earrings',
        description: 'Exquisite drop earrings featuring Colombian emeralds in a traditional Kandyan gold setting with hand-engraved lotus motifs.',
        price: 135000, discountedPrice: 118000, specialOffer: '12% Off',
        offerExpiry: '2026-05-15',
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
        metal: '21K Gold', gemstone: 'Colombian Emerald', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '6.2g', rating: 4.7, reviews: 28
      },
      {
        id: 'p_seed_4', name: 'Kandyan Bridal Set', category: 'Bridal',
        description: 'Complete Kandyan bridal jewellery set including necklace, earrings, bangles, and maang tikka in 22k gold with rubies and pearls.',
        price: 850000, discountedPrice: 750000, specialOffer: 'Bridal Season Offer',
        offerExpiry: '2026-06-30',
        images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80'],
        metal: '22K Gold', gemstone: 'Ruby & Pearl', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '85g', rating: 5.0, reviews: 15
      },
      {
        id: 'p_seed_5', name: 'Sapphire Tennis Bracelet', category: 'Bracelets',
        description: 'Elegant tennis bracelet with alternating Ceylon sapphires and white diamonds set in 18k white gold.',
        price: 195000, discountedPrice: 175000, specialOffer: '',
        offerExpiry: '',
        images: ['https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=600&q=80'],
        metal: '18K White Gold', gemstone: 'Ceylon Sapphire & Diamond', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '15g', rating: 4.6, reviews: 22
      },
      {
        id: 'p_seed_6', name: "Cat's Eye Gent Ring", category: 'Rings',
        description: "Bold gentleman's ring featuring a prized Cat's Eye Chrysoberyl in a heavy 22k gold setting with traditional engravings.",
        price: 125000, discountedPrice: 125000, specialOffer: '',
        offerExpiry: '',
        images: ['https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&q=80'],
        metal: '22K Gold', gemstone: "Cat's Eye Chrysoberyl", inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '18g', rating: 4.5, reviews: 19
      },
      {
        id: 'p_seed_7', name: 'Pearl Drop Earrings', category: 'Earrings',
        description: 'Classic South Sea pearl drop earrings with 22k gold hooks adorned with seed diamonds and fine filigree.',
        price: 75000, discountedPrice: 65000, specialOffer: '13% Off',
        offerExpiry: '2026-04-20',
        images: ['https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=600&q=80'],
        metal: '22K Gold', gemstone: 'South Sea Pearl', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '4.5g', rating: 4.7, reviews: 38
      },
      {
        id: 'p_seed_8', name: 'Blue Topaz Pendant', category: 'Necklaces',
        description: 'Faceted Swiss Blue Topaz in a prong-set 18k gold pendant with a delicate box chain.',
        price: 55000, discountedPrice: 48000, specialOffer: '',
        offerExpiry: '',
        images: ['https://images.unsplash.com/photo-1531995811006-35cb42e1a022?w=600&q=80'],
        metal: '18K Gold', gemstone: 'Swiss Blue Topaz', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '5g', rating: 4.4, reviews: 12
      },
      {
        id: 'p_seed_9', name: 'Amethyst Cluster Ring', category: 'Rings',
        description: 'Stunning cluster ring with deep purple amethysts set in 18k white gold, an elegant everyday luxury.',
        price: 68000, discountedPrice: 60000, specialOffer: 'New Arrival',
        offerExpiry: '2026-05-01',
        images: ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80'],
        metal: '18K White Gold', gemstone: 'Amethyst', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '7g', rating: 4.5, reviews: 9
      },
      {
        id: 'p_seed_10', name: 'Diamond Solitaire Ring', category: 'Rings',
        description: 'Timeless 1ct G-VS2 diamond solitaire ring in a 6-prong platinum setting. The perfect engagement ring.',
        price: 450000, discountedPrice: 420000, specialOffer: '',
        offerExpiry: '',
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'],
        metal: 'Platinum', gemstone: 'Diamond', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '5g', rating: 5.0, reviews: 67
      },
      {
        id: 'p_seed_11', name: 'Gold Bangle Set', category: 'Bracelets',
        description: 'Set of 4 traditional Kandyan plain gold bangles with fine engraved Kandyan border pattern, sold as a set.',
        price: 95000, discountedPrice: 88000, specialOffer: '',
        offerExpiry: '',
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'],
        metal: '22K Gold', gemstone: 'None', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '35g', rating: 4.6, reviews: 41
      },
      {
        id: 'p_seed_12', name: 'Moonstone Silver Pendant', category: 'Necklaces',
        description: 'Mystical rainbow moonstone set in fine sterling silver with oxidised Kandyan lotus detailing.',
        price: 18500, discountedPrice: 15000, specialOffer: '19% Off',
        offerExpiry: '2026-04-15',
        images: ['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80'],
        metal: 'Sterling Silver', gemstone: 'Rainbow Moonstone', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '3g', rating: 4.8, reviews: 55
      },
    ];
    this.saveProducts(products);
  },

  /* ── Patch existing seeded products with real image URLs ── */
  _patchSeedImages() {
    const imageMap = {
      'p_seed_1': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
      'p_seed_2': 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80',
      'p_seed_3': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
      'p_seed_4': 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
      'p_seed_5': 'https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=600&q=80',
      'p_seed_6': 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&q=80',
      'p_seed_7': 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=600&q=80',
      'p_seed_8': 'https://images.unsplash.com/photo-1531995811006-35cb42e1a022?w=600&q=80',
      'p_seed_9': 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80',
      'p_seed_10': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
      'p_seed_11': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
      'p_seed_12': 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
    };
    const raw = localStorage.getItem(this.KEYS.products);
    if (!raw) return;
    try {
      let products = JSON.parse(raw);
      let changed = false;
      products = products.map(p => {
        if (imageMap[p.id] && (!p.images[0].startsWith('http') || p.images[0].includes('images/hero'))) {
          changed = true;
          return { ...p, images: [imageMap[p.id]] };
        }
        return p;
      });
      if (changed) this.saveProducts(products);
    } catch (e) { }
  },
};



window.KGJ = KGJ;

/* ══════════════════════════════════════════════════════
   APPLY THEME — runs automatically on every page load.
   Reads saved colors + fonts from settings and injects
   them as CSS variables + Google Fonts link.
══════════════════════════════════════════════════════ */
(function applyTheme() {
  try {
    const s = KGJ.getSettings();

    // ── 1. Google Fonts ──
    const serif = s.fontSerif || 'Cormorant Garamond';
    const sans = s.fontSans || 'Inter';
    const defaultSerif = 'Cormorant Garamond';
    const defaultSans = 'Inter';
    if (serif !== defaultSerif || sans !== defaultSans) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(serif)}:wght@300;400;500;600;700&family=${encodeURIComponent(sans)}:wght@300;400;500;600&display=swap`;
      document.head.appendChild(link);
    }

    // ── 2. CSS variables ──
    const root = document.documentElement;
    const map = {
      colorGold: ['--gold-400', '--gold-500'],
      colorGoldLight: ['--gold-300', '--gold-200'],
      colorBgDark: ['--dark-200'],
      colorBgCard: ['--dark-100'],
      colorText: ['--cream-100'],
      colorRuby: ['--ruby'],
    };
    Object.entries(map).forEach(([key, vars]) => {
      if (s[key]) vars.forEach(v => root.style.setProperty(v, s[key]));
    });

    // Font variables
    if (serif !== defaultSerif) root.style.setProperty('--font-serif', `'${serif}', Georgia, serif`);
    if (sans !== defaultSans) root.style.setProperty('--font-sans', `'${sans}', Helvetica, sans-serif`);

    // ── 3. Shimmer toggle ──
    if (s.animShimmer === false) {
      const style = document.createElement('style');
      style.textContent = '.shimmer-text { animation: none !important; background-position: 0 !important; }';
      document.head.appendChild(style);
    }

    // ── 4. Particle / parallax disable stubs ──
    // (scroll.js reads these flags itself via getSettings())

  } catch (e) { /* fail silently — never break the main site */ }
})();

