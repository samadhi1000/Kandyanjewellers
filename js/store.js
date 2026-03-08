/* =====================================================
   KANDYAN GEM & JEWELLERS — Data Store (localStorage)
   ===================================================== */

const KGJ = {

  /* ── Keys ── */
  KEYS: {
    products: 'kgj_products',
    orders:   'kgj_orders',
    settings: 'kgj_settings',
    wishlist: 'kgj_wishlist',
    admin:    'kgj_admin',
  },

  /* ── Currency ── */
  currency: 'Rs.',

  fmt(amount) {
    return `${this.currency} ${Number(amount).toLocaleString('en-LK')}`;
  },

  /* ── Products ── */
  getProducts() {
    let raw = localStorage.getItem(this.KEYS.products);
    if (!raw) { this._seed(); raw = localStorage.getItem(this.KEYS.products); }
    return JSON.parse(raw);
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
    const defaults = {
      siteName:       'Kandyan Gem & Jewellers',
      tagline:        'Timeless Kandyan Craftsmanship Since 1985',
      heroTitle:      'Where Every Gem Tells a Story',
      heroSubtitle:   'Handcrafted Kandyan jewellery of unparalleled quality',
      heroCtaText:    'Explore Collection',
      phone:          '+94 81 234 5678',
      whatsapp:       '+94 77 123 4567',
      email:          'info@kandyangemandjewellers.lk',
      address:        'No. 42, Peradeniya Road, Kandy 20000, Sri Lanka',
      facebook:       'https://facebook.com',
      instagram:      'https://instagram.com',
      heroBg:         'images/hero.jpg',
      gemsBg:         'images/gems-bg.jpg',
      aboutBg:        'images/about-bg.jpg',
      collectionBg:   'images/collection-banner.jpg',
      offerBanner:    'Free shipping on orders over Rs. 15,000 | Certified Authentic Gems | 30-Day Returns',
      deliveryCharge: 350,
      codAvailable:   true,
      cardAvailable:  true,
    };
    const saved = JSON.parse(localStorage.getItem(this.KEYS.settings) || '{}');
    return { ...defaults, ...saved };
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.settings, JSON.stringify(settings));
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
      },
      {
        id: 'p_seed_7', name: 'Pearl Drop Earrings', category: 'Earrings',
        description: 'Classic South Sea pearl drop earrings with 22k gold hooks adorned with seed diamonds and fine filigree.',
        price: 75000, discountedPrice: 65000, specialOffer: '13% Off',
        offerExpiry: '2026-04-20', images: ['images/hero.jpg'],
        metal: '22K Gold', gemstone: 'South Sea Pearl', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '4.5g', rating: 4.7, reviews: 38
      },
      {
        id: 'p_seed_8', name: 'Blue Topaz Pendant', category: 'Necklaces',
        description: 'Faceted Swiss Blue Topaz in a prong-set 18k gold pendant with a delicate box chain.',
        price: 55000, discountedPrice: 48000, specialOffer: '',
        offerExpiry: '', images: ['images/about-bg.jpg'],
        metal: '18K Gold', gemstone: 'Swiss Blue Topaz', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '5g', rating: 4.4, reviews: 12
      },
      {
        id: 'p_seed_9', name: 'Amethyst Cluster Ring', category: 'Rings',
        description: 'Stunning cluster ring with deep purple amethysts set in 18k white gold, an elegant everyday luxury.',
        price: 68000, discountedPrice: 60000, specialOffer: 'New Arrival',
        offerExpiry: '2026-05-01', images: ['images/collection-banner.jpg'],
        metal: '18K White Gold', gemstone: 'Amethyst', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '7g', rating: 4.5, reviews: 9
      },
      {
        id: 'p_seed_10', name: 'Diamond Solitaire Ring', category: 'Rings',
        description: 'Timeless 1ct G-VS2 diamond solitaire ring in a 6-prong platinum setting. The perfect engagement ring.',
        price: 450000, discountedPrice: 420000, specialOffer: '',
        offerExpiry: '', images: ['images/gems-bg.jpg'],
        metal: 'Platinum', gemstone: 'Diamond', inStock: true, featured: true,
        createdAt: new Date().toISOString(), weight: '5g', rating: 5.0, reviews: 67
      },
      {
        id: 'p_seed_11', name: 'Gold Bangle Set', category: 'Bracelets',
        description: 'Set of 4 traditional Kandyan plain gold bangles with fine engraved Kandyan border pattern, sold as a set.',
        price: 95000, discountedPrice: 88000, specialOffer: '',
        offerExpiry: '', images: ['images/hero.jpg'],
        metal: '22K Gold', gemstone: 'None', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '35g', rating: 4.6, reviews: 41
      },
      {
        id: 'p_seed_12', name: 'Moonstone Silver Pendant', category: 'Necklaces',
        description: 'Mystical rainbow moonstone set in fine sterling silver with oxidised Kandyan lotus detailing.',
        price: 18500, discountedPrice: 15000, specialOffer: '19% Off',
        offerExpiry: '2026-04-15', images: ['images/about-bg.jpg'],
        metal: 'Sterling Silver', gemstone: 'Rainbow Moonstone', inStock: true, featured: false,
        createdAt: new Date().toISOString(), weight: '3g', rating: 4.8, reviews: 55
      },
    ];
    this.saveProducts(products);
  },
};

window.KGJ = KGJ;
