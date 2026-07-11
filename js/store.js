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
      // Filter out null/undefined values so defaults are preserved
      const cleanSaved = Object.fromEntries(Object.entries(saved).filter(([, v]) => v != null && v !== ''));
      settings = { ...settings, ...cleanSaved };
    } catch(e) {}

    // 2. Merge Firestore cache (filter nulls too)
    if (window._FSSettings) {
      const cleanFS = Object.fromEntries(Object.entries(window._FSSettings).filter(([, v]) => v != null && v !== ''));
      settings = { ...settings, ...cleanFS };
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
      offerBanner: 'Free shipping on orders over Rs. 15,000 | Certified Authentic Gems | Lifetime Warranty on Gold-Plated Jewellery | Latest Designs',

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
      aboutS2P1: 'At a time when the art of Kandyan jewelry making—a legacy passed down through generations of traditional hill country craftsmen—is gradually fading, we proudly stand committed to preserving it. By empowering the livelihoods of these master artisans and passing this heritage down to future generations, we strive to be a pillar of strength in ensuring this invaluable art form continues to thrive for years to come.<br><br>At "Kandyan Gem," we seamlessly blend these ancient techniques with the artistry and precision of modern jewelry and gem crafting, creating exquisite, timeless pieces that you can wear with absolute pride.',
      aboutS2P2: 'කන්ද උඩරට සාම්ප්රදායික ස්වර්ණාභරණ ශිල්පීන්ගේ පරම්පරා ගණනාවක   උරුමයක් වන උඩරට ස්වර්ණාභරණ නිමැවුම් කලාව මිය යමින් පවතින කාල වකවානුවක එම කලාව රැක ගනිමින් එම ප්රවීණ ශිල්පීන් හටද තම ජීවනෝපායට ඉමහත් ශක්තියක් වෙමින් මෙම කලාව තවත් චිරාත් කාලයක් පවත්වාගෙන යාමට මතු පරපුරට දායාද කරමින් එම වටිනා කලාව සුරැකීමට සවියක් වන බව අභිමානයෙන් යුතුව දන්වා සිටිමු<br><br>"කැන්ඩියන් ජෙම්" අපි මෙම පුරාණ ශිල්පීය ක්රම සහ නවීන ස්වර්ණාභරණ මෙන්ම මැණික් සැකසීමේ කලාව සහ නිරවද්යතාවය සමඟ ඒකාබද්ධ කර කාලානුරූපී සහ අභිමානයෙන් යුතුව පැළඳිය හැකි විශිෂ්ට ආභරණ නිර්මාණය කරමු.',
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
            "id": "p_seed_new_1",
            "name": "Elegant Jewellery Set",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated elegant jewellery set with detailed design. Durable and perfect for any special occasion.",
            "price": 4500,
            "discountedPrice": 4500,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_jewellery_set_4500_1.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:00:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 10
      },
      {
            "id": "p_seed_new_2",
            "name": "Classic Gold Chain",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated classic gold chain with detailed design. Durable and perfect for any special occasion.",
            "price": 4500,
            "discountedPrice": 4500,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_classic_gold_chain_4500_2.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:01:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 11
      },
      {
            "id": "p_seed_new_3",
            "name": "Delicate Gold Bracelet",
            "category": "Bracelet",
            "description": "Beautiful handcrafted 24k gold-plated delicate gold bracelet with detailed design. Durable and perfect for any special occasion.",
            "price": 2850,
            "discountedPrice": 2850,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_delicate_gold_bracelet_2850_3.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:02:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 12
      },
      {
            "id": "p_seed_new_4",
            "name": "Chain with Pendant",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated chain with pendant with detailed design. Durable and perfect for any special occasion.",
            "price": 6000,
            "discountedPrice": 6000,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_chain_with_pendant_6000_4.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:03:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 13
      },
      {
            "id": "p_seed_new_5",
            "name": "Adjustable Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated adjustable gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_adjustable_gold_ring_3500_5.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:04:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 14
      },
      {
            "id": "p_seed_new_6",
            "name": "Classic Earring Studs",
            "category": "Earrings",
            "description": "Beautiful handcrafted 24k gold-plated classic earring studs with detailed design. Durable and perfect for any special occasion.",
            "price": 2500,
            "discountedPrice": 2500,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_classic_earring_studs_2500_6.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:05:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 15
      },
      {
            "id": "p_seed_new_7",
            "name": "Elegant Gold Bracelet",
            "category": "Bracelet",
            "description": "Beautiful handcrafted 24k gold-plated elegant gold bracelet with detailed design. Durable and perfect for any special occasion.",
            "price": 2850,
            "discountedPrice": 2850,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_elegant_gold_bracelet_2850_7.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:06:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 16
      },
      {
            "id": "p_seed_new_8",
            "name": "Beaded Gold Bracelet",
            "category": "Bracelet",
            "description": "Beautiful handcrafted 24k gold-plated beaded gold bracelet with detailed design. Durable and perfect for any special occasion.",
            "price": 2850,
            "discountedPrice": 2850,
            "specialOffer": "Featured",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_beaded_gold_bracelet_2850_8.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": true,
            "createdAt": "2026-07-11T12:07:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 17
      },
      {
            "id": "p_seed_new_9",
            "name": "Floral Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated floral gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_floral_gold_ring_3500_9.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:08:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 18
      },
      {
            "id": "p_seed_new_10",
            "name": "Minimalist Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated minimalist gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_minimalist_gold_ring_3500_10.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:09:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 19
      },
      {
            "id": "p_seed_new_11",
            "name": "Stackable Gold Rings",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated stackable gold rings with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_stackable_gold_rings_3500_11.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:10:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 20
      },
      {
            "id": "p_seed_new_12",
            "name": "Gold Hoop Earrings",
            "category": "Earrings",
            "description": "Beautiful handcrafted 24k gold-plated gold hoop earrings with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_gold_hoop_earrings_3500_12.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:11:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 21
      },
      {
            "id": "p_seed_new_13",
            "name": "Elegant Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated elegant gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_elegant_gold_ring_3500_13.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:12:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 22
      },
      {
            "id": "p_seed_new_14",
            "name": "Delicate Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated delicate gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_delicate_gold_ring_3500_14.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:13:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 23
      },
      {
            "id": "p_seed_new_15",
            "name": "Luxury Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated luxury gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3850,
            "discountedPrice": 3850,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_luxury_gold_ring_3850_15.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:14:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 24
      },
      {
            "id": "p_seed_new_16",
            "name": "Gold Bangle",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated gold bangle with detailed design. Durable and perfect for any special occasion.",
            "price": 4500,
            "discountedPrice": 4500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_gold_bangle_4500_16.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:15:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 25
      },
      {
            "id": "p_seed_new_17",
            "name": "Classic Gold Bangle",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated classic gold bangle with detailed design. Durable and perfect for any special occasion.",
            "price": 4500,
            "discountedPrice": 4500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_classic_gold_bangle_4500_17.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:16:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 26
      },
      {
            "id": "p_seed_new_18",
            "name": "Intricate Gold Bangle",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated intricate gold bangle with detailed design. Durable and perfect for any special occasion.",
            "price": 4500,
            "discountedPrice": 4500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_intricate_gold_bangle_4500_18.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:17:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 27
      },
      {
            "id": "p_seed_new_19",
            "name": "Artistic Gold Bracelet",
            "category": "Bracelet",
            "description": "Beautiful handcrafted 24k gold-plated artistic gold bracelet with detailed design. Durable and perfect for any special occasion.",
            "price": 4500,
            "discountedPrice": 4500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_artistic_gold_bracelet_4500_19.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:18:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 28
      },
      {
            "id": "p_seed_new_20",
            "name": "Premium Gold Bracelet",
            "category": "Bracelet",
            "description": "Beautiful handcrafted 24k gold-plated premium gold bracelet with detailed design. Durable and perfect for any special occasion.",
            "price": 5000,
            "discountedPrice": 5000,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_premium_gold_bracelet_5000_20.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:19:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 29
      },
      {
            "id": "p_seed_new_21",
            "name": "Exquisite Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated exquisite gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 6000,
            "discountedPrice": 6000,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_exquisite_gold_ring_6000_21.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:20:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 30
      },
      {
            "id": "p_seed_new_22",
            "name": "Luxury Gold Necklace",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated luxury gold necklace with detailed design. Durable and perfect for any special occasion.",
            "price": 6000,
            "discountedPrice": 6000,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_luxury_gold_necklace_6000_22.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:21:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 31
      },
      {
            "id": "p_seed_new_23",
            "name": "Premium Gold Necklace",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated premium gold necklace with detailed design. Durable and perfect for any special occasion.",
            "price": 6000,
            "discountedPrice": 6000,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_premium_gold_necklace_6000_23.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:22:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 32
      },
      {
            "id": "p_seed_new_24",
            "name": "Exquisite Gold Necklace",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated exquisite gold necklace with detailed design. Durable and perfect for any special occasion.",
            "price": 6500,
            "discountedPrice": 6500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_exquisite_gold_necklace_6500_24.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:23:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 33
      },
      {
            "id": "p_seed_new_25",
            "name": "Artistic Gold Necklace",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated artistic gold necklace with detailed design. Durable and perfect for any special occasion.",
            "price": 6500,
            "discountedPrice": 6500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_artistic_gold_necklace_6500_25.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:24:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 34
      },
      {
            "id": "p_seed_new_26",
            "name": "Premium Gold Bangle",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated premium gold bangle with detailed design. Durable and perfect for any special occasion.",
            "price": 6500,
            "discountedPrice": 6500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_premium_gold_bangle_6500_26.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:25:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 35
      },
      {
            "id": "p_seed_new_27",
            "name": "Exquisite Gold Bangle",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated exquisite gold bangle with detailed design. Durable and perfect for any special occasion.",
            "price": 6500,
            "discountedPrice": 6500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_exquisite_gold_bangle_6500_27.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:26:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 36
      },
      {
            "id": "p_seed_new_28",
            "name": "Delicate Gold Necklace",
            "category": "Chain with Pendant",
            "description": "Beautiful handcrafted 24k gold-plated delicate gold necklace with detailed design. Durable and perfect for any special occasion.",
            "price": 6500,
            "discountedPrice": 6500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_delicate_gold_necklace_6500_28.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:27:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 37
      },
      {
            "id": "p_seed_new_29",
            "name": "Luxury Gold Bangle",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated luxury gold bangle with detailed design. Durable and perfect for any special occasion.",
            "price": 7000,
            "discountedPrice": 7000,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_luxury_gold_bangle_7000_29.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:28:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 38
      },
      {
            "id": "p_seed_new_30",
            "name": "Premium Gold Bangle Set",
            "category": "Bangles",
            "description": "Beautiful handcrafted 24k gold-plated premium gold bangle set with detailed design. Durable and perfect for any special occasion.",
            "price": 7000,
            "discountedPrice": 7000,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_premium_gold_bangle_set_7000_30.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:29:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 39
      },
      {
            "id": "p_seed_new_31",
            "name": "Custom Size Gold Ring",
            "category": "Rings",
            "description": "Beautiful handcrafted 24k gold-plated custom size gold ring with detailed design. Durable and perfect for any special occasion.",
            "price": 3500,
            "discountedPrice": 3500,
            "specialOffer": "",
            "offerExpiry": "",
            "images": [
                  "images/uploads/prod_custom_size_gold_ring_3500_31.jpg"
            ],
            "metal": "24K Gold Plated",
            "gemstone": "None",
            "inStock": true,
            "featured": false,
            "createdAt": "2026-07-11T12:30:00.000Z",
            "weight": "5g",
            "rating": 4.8,
            "reviews": 40
      }
];
    this.saveProducts(products);
  },

  /* ── Patch existing seeded products with real image URLs ── */
  _patchSeedImages() {
    const imageMap = {
      "p_seed_new_1": "images/uploads/prod_jewellery_set_4500_1.jpg",
      "p_seed_new_2": "images/uploads/prod_classic_gold_chain_4500_2.jpg",
      "p_seed_new_3": "images/uploads/prod_delicate_gold_bracelet_2850_3.jpg",
      "p_seed_new_4": "images/uploads/prod_chain_with_pendant_6000_4.jpg",
      "p_seed_new_5": "images/uploads/prod_adjustable_gold_ring_3500_5.jpg",
      "p_seed_new_6": "images/uploads/prod_classic_earring_studs_2500_6.jpg",
      "p_seed_new_7": "images/uploads/prod_elegant_gold_bracelet_2850_7.jpg",
      "p_seed_new_8": "images/uploads/prod_beaded_gold_bracelet_2850_8.jpg",
      "p_seed_new_9": "images/uploads/prod_floral_gold_ring_3500_9.jpg",
      "p_seed_new_10": "images/uploads/prod_minimalist_gold_ring_3500_10.jpg",
      "p_seed_new_11": "images/uploads/prod_stackable_gold_rings_3500_11.jpg",
      "p_seed_new_12": "images/uploads/prod_gold_hoop_earrings_3500_12.jpg",
      "p_seed_new_13": "images/uploads/prod_elegant_gold_ring_3500_13.jpg",
      "p_seed_new_14": "images/uploads/prod_delicate_gold_ring_3500_14.jpg",
      "p_seed_new_15": "images/uploads/prod_luxury_gold_ring_3850_15.jpg",
      "p_seed_new_16": "images/uploads/prod_gold_bangle_4500_16.jpg",
      "p_seed_new_17": "images/uploads/prod_classic_gold_bangle_4500_17.jpg",
      "p_seed_new_18": "images/uploads/prod_intricate_gold_bangle_4500_18.jpg",
      "p_seed_new_19": "images/uploads/prod_artistic_gold_bracelet_4500_19.jpg",
      "p_seed_new_20": "images/uploads/prod_premium_gold_bracelet_5000_20.jpg",
      "p_seed_new_21": "images/uploads/prod_exquisite_gold_ring_6000_21.jpg",
      "p_seed_new_22": "images/uploads/prod_luxury_gold_necklace_6000_22.jpg",
      "p_seed_new_23": "images/uploads/prod_premium_gold_necklace_6000_23.jpg",
      "p_seed_new_24": "images/uploads/prod_exquisite_gold_necklace_6500_24.jpg",
      "p_seed_new_25": "images/uploads/prod_artistic_gold_necklace_6500_25.jpg",
      "p_seed_new_26": "images/uploads/prod_premium_gold_bangle_6500_26.jpg",
      "p_seed_new_27": "images/uploads/prod_exquisite_gold_bangle_6500_27.jpg",
      "p_seed_new_28": "images/uploads/prod_delicate_gold_necklace_6500_28.jpg",
      "p_seed_new_29": "images/uploads/prod_luxury_gold_bangle_7000_29.jpg",
      "p_seed_new_30": "images/uploads/prod_premium_gold_bangle_set_7000_30.jpg",
      "p_seed_new_31": "images/uploads/prod_custom_size_gold_ring_3500_31.jpg"
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

