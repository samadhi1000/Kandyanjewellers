/* =====================================================
   KANDYAN GEM & JEWELLERS — Shared Components
   ===================================================== */

const Components = {

  /* Determine relative path prefix based on current page depth */
  get prefix() {
    return window.location.pathname.includes('/admin/') ? '../' : '';
  },

  /* ── Apply settings to dynamic elements ── */
  applySettings() {
    const s = KGJ.getSettings();
    // Apply dynamic background images stored in settings
    const heroBgEl = document.getElementById('hero-bg');
    if (heroBgEl) {
      heroBgEl.style.backgroundImage = `url('${this.prefix}${s.heroBg}')`;
      heroBgEl.style.backgroundPosition = s.heroBgPos || 'center';
    }

    const gemsBgEl = document.getElementById('gems-bg');
    if (gemsBgEl) gemsBgEl.style.backgroundImage = `url('${this.prefix}${s.gemsBg}')`;

    const aboutBgEl = document.getElementById('about-bg');
    if (aboutBgEl) aboutBgEl.style.backgroundImage = `url('${this.prefix}${s.aboutBg}')`;

    const shopHeroBgEl = document.getElementById('shop-hero-bg');
    if (shopHeroBgEl) {
      shopHeroBgEl.style.backgroundImage = `url('${this.prefix}${s.shopHeroBg}')`;
      shopHeroBgEl.style.backgroundPosition = s.shopHeroBgPos || 'center';
    }

    const aboutHeroBgEl = document.getElementById('about-hero-bg');
    if (aboutHeroBgEl) {
      aboutHeroBgEl.style.backgroundImage = `url('${this.prefix}${s.aboutHeroBg}')`;
      aboutHeroBgEl.style.backgroundPosition = s.aboutHeroBgPos || 'center';
    }

    // Multiple fixed-bg sections

    document.querySelectorAll('[data-bg="about"]').forEach(el => {
      el.style.backgroundImage = `url('${this.prefix}${s.aboutBg}')`;
    });
    document.querySelectorAll('[data-bg="gems"]').forEach(el => {
      el.style.backgroundImage = `url('${this.prefix}${s.gemsBg}')`;
    });
    document.querySelectorAll('[data-bg="collection"]').forEach(el => {
      el.style.backgroundImage = `url('${this.prefix}${s.collectionBg}')`;
    });

    // Ticker
    const tickerTrack = document.querySelector('.ticker-track');
    if (tickerTrack && s.offerBanner) {
      const msgs = s.offerBanner.split('|').map(m => m.trim());
      const items = msgs.map(m => {
        let icon = 'fa-gem';
        if (m.toLowerCase().includes('shipping')) icon = 'fa-truck';
        else if (m.toLowerCase().includes('certified') || m.toLowerCase().includes('authentic')) icon = 'fa-certificate';
        else if (m.toLowerCase().includes('warranty')) icon = 'fa-shield-alt';
        return `<span class="ticker-item"><i class="fas ${icon}"></i>${m}</span>`;
      }).join('');
      tickerTrack.innerHTML = items + items; // duplicate for seamless loop
    }

    // Update hero text
    const heroTitleEl = document.getElementById('hero-title');
    if (heroTitleEl) heroTitleEl.textContent = s.heroTitle;
    const heroSubEl = document.getElementById('hero-subtitle');
    if (heroSubEl) heroSubEl.textContent = s.heroSubtitle;
    const heroCtaEl = document.getElementById('hero-cta');
    if (heroCtaEl) heroCtaEl.textContent = s.heroCtaText;
  },

  /* ── Render Nav (inject into any page) ── */
  renderNav(activePage = '') {
    const s = KGJ.getSettings();
    const p = this.prefix;
    const links = [
      { href: `${p}index.html`, label: 'Home', key: 'home' },
      { href: `${p}shop.html`, label: 'Shop', key: 'shop' },
      { href: `${p}about.html`, label: 'About', key: 'about' },
      { href: `${p}contact.html`, label: 'Contact', key: 'contact' },
    ];
    return `
    <nav class="navbar" id="main-nav">
      <div class="nav-inner">
        <a href="${p}index.html" class="logo">
          ${s.siteName}
          <span>Est. 1995 &bull; Fine Gems &amp; Craftsmanship</span>
        </a>
        <div class="nav-links">
          ${links.map(l => `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`).join('')}
        </div>
        <div class="nav-actions">
          <button class="nav-icon-btn" id="search-toggle-btn" title="Search" aria-label="Search">
            <i class="fas fa-search"></i>
          </button>
          <a href="${p}shop.html#wishlist" class="nav-icon-btn" title="Wishlist" aria-label="Wishlist">
            <i class="fas fa-heart"></i>
          </a>
          <button class="nav-icon-btn" data-cart-toggle aria-label="Cart">
            <i class="fas fa-shopping-bag"></i>
            <span class="cart-badge" id="cart-badge"></span>
          </button>
        </div>
        <button class="hamburger" id="hamburger-btn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Nav -->
    <div class="mobile-nav-overlay" id="mobile-nav-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;backdrop-filter:blur(4px)"></div>
    <div class="mobile-nav" id="mobile-nav" style="position:fixed;top:0;right:0;bottom:0;width:280px;background:var(--dark-100);border-left:1px solid rgba(212,160,23,0.2);z-index:1000;transform:translateX(100%);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);padding:2rem;display:flex;flex-direction:column;gap:1.5rem">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:var(--font-serif);color:var(--gold-400)">Menu</span>
        <button id="mobile-nav-close" style="background:none;color:var(--cream-300);font-size:1.4rem">&times;</button>
      </div>
      ${links.map(l => `<a href="${l.href}" style="font-size:1.1rem;font-family:var(--font-serif);color:var(--cream-100);border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:1rem">${l.label}</a>`).join('')}
      <a href="${p}admin/index.html" style="font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--cream-300);opacity:0.5;margin-top:auto">Admin Panel</a>
    </div>

    <!-- Search Overlay -->
    <div class="search-overlay" id="search-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1200;align-items:flex-start;justify-content:center;padding-top:15vh">
      <div style="width:100%;max-width:640px;padding:0 2rem">
        <div style="position:relative">
          <i class="fas fa-search" style="position:absolute;left:1.25rem;top:50%;transform:translateY(-50%);color:var(--gold-400)"></i>
          <input type="text" id="search-input" placeholder="Search gems, jewellery, collections..." 
            style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(212,160,23,0.4);border-radius:50px;padding:1.1rem 1.25rem 1.1rem 3rem;font-size:1.1rem;color:var(--cream-100);outline:none">
          <button id="search-close-btn" style="position:absolute;right:1.25rem;top:50%;transform:translateY(-50%);background:none;color:var(--cream-300);font-size:1.2rem">&times;</button>
        </div>
        <div id="search-results" style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.75rem;max-height:50vh;overflow-y:auto"></div>
      </div>
    </div>`;
  },

  /* ── Render Footer ── */
  renderFooter() {
    const s = KGJ.getSettings();
    const p = this.prefix;
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="logo-text">${s.siteName}</div>
            <div class="logo-sub">Est. 1995 &bull; Fine Gems &amp; Craftsmanship &bull; Kandy</div>
            <p>Purveyors of exquisite Kandyan jewellery and certified precious gemstones for over three decades. Every piece tells a timeless story.</p>
            <div class="footer-social">
              <a href="${s.facebook}" class="social-btn" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="${s.instagram}" class="social-btn" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://wa.me/${(s.whatsapp || '').replace(/\D/g, '')}" class="social-btn" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
              <a href="mailto:${s.email}" class="social-btn" aria-label="Email"><i class="fas fa-envelope"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a href="${p}shop.html?cat=Rings">Rings</a></li>
              <li><a href="${p}shop.html?cat=Necklaces">Necklaces</a></li>
              <li><a href="${p}shop.html?cat=Earrings">Earrings</a></li>
              <li><a href="${p}shop.html?cat=Bracelets">Bracelets</a></li>
              <li><a href="${p}shop.html?cat=Bridal">Bridal Sets</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Information</h4>
            <ul>
              <li><a href="${p}about.html">Our Story</a></li>
              <li><a href="${p}about.html#certificates">Certifications</a></li>
              <li><a href="${p}contact.html">Contact Us</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Return Policy</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="tel:${s.phone}"><i class="fas fa-phone" style="width:14px;color:var(--gold-400)"></i> ${s.phone}</a></li>
              <li><a href="https://wa.me/${(s.whatsapp || '').replace(/\D/g, '')}" target="_blank"><i class="fab fa-whatsapp" style="width:14px;color:var(--gold-400)"></i> ${s.whatsapp || ''}</a></li>
              <li><a href="mailto:${s.email}"><i class="fas fa-envelope" style="width:14px;color:var(--gold-400)"></i> ${s.email}</a></li>
              <li style="display:flex;gap:0.5rem;align-items:flex-start"><i class="fas fa-map-marker-alt" style="width:14px;color:var(--gold-400);margin-top:3px;flex-shrink:0"></i><span>${s.address}</span></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom" style="display:flex; flex-direction:column; gap:1.5rem; align-items:center; opacity:0.95; border-top:1px solid rgba(255,255,255,0.06); padding-top:2rem; margin-top:2rem;">
          <div style="display:flex; align-items:center; gap:2.5rem; justify-content:space-between; width:100%; flex-wrap:wrap;">
            <!-- Logo block -->
            <a href="https://www.stackunleash.com/" target="_blank" rel="noopener" class="su-logo-group" style="display:flex; align-items:center; gap:0.85rem; text-decoration:none; text-align:left;">
              <div class="su-logo-icon-wrapper" style="transition: transform 0.3s ease; display: flex; align-items: center;">
                <img src="${p}images/stackunleash-logo.png" alt="StackUnleash Logo" style="height:48px; width:auto; object-fit:contain;" />
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-start; line-height:1;">
                <span style="font-size:1.45rem; font-weight:900; letter-spacing:-0.01em; color:#fff; font-family:var(--font-sans), sans-serif; display:flex; align-items:center;">
                  STACK<span class="gradient-text" style="font-weight:950; margin-left:1px;">UNLEASH</span>
                </span>
                <span class="shine-text" style="font-size:0.55rem; font-weight:900; letter-spacing:0.25em; text-transform:uppercase; margin-top:0.35rem; font-family:var(--font-sans), sans-serif;">
                  Build &bull; Automate &bull; Scale
                </span>
              </div>
            </a>
            
            <!-- Paragraph block -->
            <p style="max-width:620px; font-size:0.825rem; color:var(--cream-300); opacity:0.8; line-height:1.6; margin:0; text-align:left; flex:1; min-width:280px;">
              Meticulously crafted to deliver a seamless digital experience. Proudly designed with ❤️ in Kandy, Sri Lanka. Another quality design by StackUnleash—empowering brands through cutting-edge web technology.
            </p>
          </div>

          <!-- Bottom Credits Row -->
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:0.75rem; color:var(--cream-300); opacity:0.5; border-top:1px solid rgba(255,255,255,0.03); padding-top:1rem; flex-wrap:wrap; gap:0.75rem;">
            <span>&copy; ${new Date().getFullYear()} ${s.siteName}. All rights reserved.</span>
            <span>Proudly designed with <i class="fas fa-heart" style="color:var(--ruby)"></i> in Kandy, Sri Lanka</span>
          </div>
        </div>
      </div>
    </footer>`;
  },

  /* ── Render Cart Drawer ── */
  renderCartDrawer() {
    const p = this.prefix;
    return `
    <div class="cart-overlay" id="cart-overlay"></div>
    <div class="cart-drawer" id="cart-drawer" role="dialog" aria-label="Shopping Cart">
      <div class="cart-drawer-header">
        <h3>Shopping Cart</h3>
        <button class="cart-close-btn" id="cart-close-btn" aria-label="Close cart"><i class="fas fa-times"></i></button>
      </div>
      <div class="cart-items-list" id="cart-items-list"></div>
      <div class="cart-footer">
        <div class="cart-subtotal" id="cart-subtotal"></div>
        <div id="cart-total" style="margin-bottom:1.25rem"></div>
        <a href="${p}checkout.html" class="btn btn-primary w-full" id="checkout-btn" style="display:flex;justify-content:center">
          <i class="fas fa-lock"></i> Proceed to Checkout
        </a>
        <button class="btn btn-ghost w-full" style="margin-top:0.75rem;display:flex;justify-content:center" onclick="Cart.closeDrawer()">
          Continue Shopping
        </button>
      </div>
    </div>
    <div class="toast-container" id="toast-container"></div>`;
  },

  /* ── Init shared behaviours ── */
  initMobileNav() {
    const hamburger = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const closeBtn = document.getElementById('mobile-nav-close');

    if (!hamburger) return;

    // Remove old listeners if re-initializing
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    
    const openNav = () => {
      mobileNav.style.transform = 'translateX(0)';
      mobileOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    };
    const closeNav = () => {
      mobileNav.style.transform = 'translateX(100%)';
      mobileOverlay.style.display = 'none';
      document.body.style.overflow = '';
    };

    newHamburger.addEventListener('click', openNav);
    closeBtn?.addEventListener('click', closeNav);
    mobileOverlay?.addEventListener('click', closeNav);
  },

  initSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    const openBtn = document.getElementById('search-toggle-btn');
    const closeBtn = document.getElementById('search-close-btn');
    const p = this.prefix;

    if (!openBtn) return;
    
    // Remove old listeners if re-initializing
    const newOpenBtn = openBtn.cloneNode(true);
    openBtn.parentNode.replaceChild(newOpenBtn, openBtn);

    newOpenBtn.addEventListener('click', () => {
      overlay.style.display = 'flex';
      setTimeout(() => input?.focus(), 100);
    });
    closeBtn?.addEventListener('click', () => { overlay.style.display = 'none'; });
    overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });

    input?.addEventListener('input', () => {
      const q = input.value.trim();
      if (q.length < 2) { resultsEl.innerHTML = ''; return; }
      const results = KGJ.searchProducts(q).slice(0, 6);
      if (!results.length) {
        resultsEl.innerHTML = `<p style="color:var(--cream-300);opacity:0.6;text-align:center;padding:1rem">No results found.</p>`;
        return;
      }
      resultsEl.innerHTML = results.map(r => `
        <a href="${p}product.html?id=${r.id}" style="display:flex;gap:1rem;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;text-decoration:none;transition:border-color 0.2s" 
          onmouseover="this.style.borderColor='rgba(212,160,23,0.4)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
          <img src="${p}${r.images[0]}" style="width:52px;height:52px;border-radius:8px;object-fit:cover">
          <div>
            <div style="font-family:var(--font-serif);font-size:1rem;color:var(--cream-100)">${r.name}</div>
            <div style="font-size:0.8rem;color:var(--gold-400)">${KGJ.fmt(r.discountedPrice < r.price ? r.discountedPrice : r.price)}</div>
          </div>
        </a>`).join('');
    });
  },

  /**
   * Refresh Nav and Footer with latest settings
   * Useful after fetching settings from Firestore
   */
  refresh(activePage = '') {
    try {
      const navHolder = document.getElementById('nav-placeholder');
      if (navHolder) navHolder.innerHTML = this.renderNav(activePage);

      const footerHolder = document.getElementById('footer-placeholder');
      if (footerHolder) footerHolder.innerHTML = this.renderFooter();

      this.applySettings();
      this.initMobileNav();
      this.initSearch();
      console.log('[KGJ] UI Components Refreshed');
    } catch(e) {
      console.error('[KGJ] Components.refresh error:', e);
    }
  },

  init(activePage = '') {
    try {
      // Inject nav
      const navHolder = document.getElementById('nav-placeholder');
      if (navHolder) navHolder.innerHTML = this.renderNav(activePage);

      // Inject footer
      const footerHolder = document.getElementById('footer-placeholder');
      if (footerHolder) footerHolder.innerHTML = this.renderFooter();

      // Inject cart drawer
      const cartHolder = document.getElementById('cart-placeholder');
      if (cartHolder) cartHolder.innerHTML = this.renderCartDrawer();

      this.applySettings();
      this.initMobileNav();
      this.initSearch();
      if (window.Cart) Cart.init();
      if (window.ScrollEngine) ScrollEngine.init();
    } catch(e) {
      console.error('[KGJ] Components.init error:', e);
      // Fallback: try re-rendering with clean defaults
      try {
        window._FSSettings = null;
        const navHolder = document.getElementById('nav-placeholder');
        if (navHolder) navHolder.innerHTML = this.renderNav(activePage);
        const footerHolder = document.getElementById('footer-placeholder');
        if (footerHolder) footerHolder.innerHTML = this.renderFooter();
        const cartHolder = document.getElementById('cart-placeholder');
        if (cartHolder) cartHolder.innerHTML = this.renderCartDrawer();
        this.applySettings();
        this.initMobileNav();
        this.initSearch();
        if (window.Cart) Cart.init();
      } catch(e2) { console.error('[KGJ] Components.init fallback error:', e2); }
    }
  },
};

window.Components = Components;
