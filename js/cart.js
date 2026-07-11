/* =====================================================
   KANDYAN GEM & JEWELLERS — Cart Module
   ===================================================== */

const Cart = {
    CART_KEY: 'kgj_cart',

    getItems() {
        return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]');
    },

    save(items) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(items));
        this.updateUI();
    },

    addItem(productId, qty = 1) {
        const product = KGJ.getProduct(productId);
        if (!product) return;
        const items = this.getItems();
        const existing = items.find(i => i.productId === productId);
        if (existing) {
            existing.qty = Math.min(existing.qty + qty, 10);
        } else {
            items.push({ productId, qty, addedAt: new Date().toISOString() });
        }
        this.save(items);
        this.showToast(`${product.name} added to cart!`);
        this.openDrawer();
    },

    removeItem(productId) {
        const items = this.getItems().filter(i => i.productId !== productId);
        this.save(items);
    },

    updateQty(productId, qty) {
        if (qty < 1) { this.removeItem(productId); return; }
        const items = this.getItems();
        const item = items.find(i => i.productId === productId);
        if (item) item.qty = Math.min(qty, 10);
        this.save(items);
    },

    clear() {
        localStorage.removeItem(this.CART_KEY);
        this.updateUI();
    },

    getCount() {
        return this.getItems().reduce((sum, i) => sum + i.qty, 0);
    },

    getSubtotal() {
        const settings = KGJ.getSettings();
        return this.getItems().reduce((sum, i) => {
            const p = KGJ.getProduct(i.productId);
            if (!p) return sum;
            const price = p.discountedPrice < p.price ? p.discountedPrice : p.price;
            return sum + (price * i.qty);
        }, 0);
    },

    getTotal() {
        const settings = KGJ.getSettings();
        const sub = this.getSubtotal();
        return sub > 15000 ? sub : sub + (settings.deliveryCharge || 350);
    },

    /* ── UI ── */
    updateUI() {
        const count = this.getCount();
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => {
            b.textContent = count;
            b.classList.toggle('show', count > 0);
        });
        this.renderDrawer();
    },

    renderDrawer() {
        const listEl = document.getElementById('cart-items-list');
        const subtotalEl = document.getElementById('cart-subtotal');
        const totalEl = document.getElementById('cart-total');
        if (!listEl) return;

        const items = this.getItems();

        if (items.length === 0) {
            listEl.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-gem"></i>
          <p>Your cart is empty.</p>
          <p class="body-sm" style="margin-top:0.5rem">Discover our beautiful collection!</p>
        </div>`;
        } else {
            listEl.innerHTML = items.map(item => {
                const p = KGJ.getProduct(item.productId);
                if (!p) return '';
                const price = p.discountedPrice < p.price ? p.discountedPrice : p.price;
                return `
          <div class="cart-item">
            <img src="${p.images[0] || 'images/hero.jpg'}" alt="${p.name}" class="cart-item-img">
            <div class="cart-item-info">
              <div class="cart-item-name">${p.name}</div>
              <div class="cart-item-price">${KGJ.fmt(price)}</div>
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="Cart.updateQty('${p.id}', ${item.qty - 1})"><i class="fas fa-minus"></i></button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="Cart.updateQty('${p.id}', ${item.qty + 1})"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <button class="cart-item-remove" onclick="Cart.removeItem('${p.id}')"><i class="fas fa-times"></i></button>
          </div>`;
            }).join('');
        }

        const sub = this.getSubtotal();
        const total = this.getTotal();
        const settings = KGJ.getSettings();
        const deliveryMsg = sub > 15000 ? '<span style="color:var(--emerald);font-size:0.75rem">✓ Free Shipping</span>' : KGJ.fmt(settings.deliveryCharge || 350);

        if (subtotalEl) subtotalEl.innerHTML = `<span>Subtotal</span><span>${KGJ.fmt(sub)}</span>`;
        if (totalEl) totalEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.8rem;opacity:0.7">
        <span>Delivery</span><span>${deliveryMsg}</span>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase">Total</span>
        <span style="font-family:var(--font-serif);font-size:1.4rem;color:var(--gold-400)">${KGJ.fmt(total)}</span>
      </div>`;
    },

    openDrawer() {
        document.getElementById('cart-drawer')?.classList.add('open');
        document.getElementById('cart-overlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    },

    closeDrawer() {
        document.getElementById('cart-drawer')?.classList.remove('open');
        document.getElementById('cart-overlay')?.classList.remove('open');
        document.body.style.overflow = '';
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || (() => {
            const el = document.createElement('div');
            el.id = 'toast-container';
            el.className = 'toast-container';
            document.body.appendChild(el);
            return el;
        })();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'gem'}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'none';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    init() {
        // Cart toggle buttons
        document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const drawer = document.getElementById('cart-drawer');
                if (drawer?.classList.contains('open')) this.closeDrawer();
                else this.openDrawer();
            });
        });

        // Overlay close
        document.getElementById('cart-overlay')?.addEventListener('click', () => this.closeDrawer());
        document.getElementById('cart-close-btn')?.addEventListener('click', () => this.closeDrawer());

        this.updateUI();
    },
};

window.Cart = Cart;
