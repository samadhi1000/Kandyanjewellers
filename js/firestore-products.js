/* =====================================================
   KANDYAN GEM & JEWELLERS — Firestore Product Module
   All product data is now stored in Firestore so that
   every device sees the same up-to-date catalogue.
   ===================================================== */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, addDoc,
  setDoc, deleteDoc, doc, query, orderBy
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
const COL = 'products';

/* ── Seed data (12 default products) ─────────────────── */
const SEED = [
  {
    id: 'p_seed_1', name: 'Royal Sapphire Ring', category: 'Rings',
    description: 'A breathtaking 3ct Ceylon Blue Sapphire set in 22k gold with intricate Kandyan filigree work. Certified by the National Gem and Jewellery Authority of Sri Lanka.',
    price: 185000, discountedPrice: 165000, specialOffer: 'Valentine Special',
    offerExpiry: '2026-04-30',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'],
    metal: '22K Gold', gemstone: 'Ceylon Blue Sapphire', inStock: true, featured: true,
    createdAt: '2026-01-01T00:00:00.000Z', weight: '8.5g', rating: 4.9, reviews: 47
  },
  {
    id: 'p_seed_2', name: 'Ruby Pendant Necklace', category: 'Necklaces',
    description: 'Stunning Burmese ruby pendant set in 18k rose gold with diamond halo. Comes with a 22-inch rose gold chain.',
    price: 245000, discountedPrice: 245000, specialOffer: '',
    offerExpiry: '',
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80'],
    metal: '18K Rose Gold', gemstone: 'Burmese Ruby', inStock: true, featured: true,
    createdAt: '2026-01-02T00:00:00.000Z', weight: '12g', rating: 4.8, reviews: 31
  },
  {
    id: 'p_seed_3', name: 'Emerald Cascade Earrings', category: 'Earrings',
    description: 'Exquisite drop earrings featuring Colombian emeralds in a traditional Kandyan gold setting with hand-engraved lotus motifs.',
    price: 135000, discountedPrice: 118000, specialOffer: '12% Off',
    offerExpiry: '2026-05-15',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    metal: '21K Gold', gemstone: 'Colombian Emerald', inStock: true, featured: true,
    createdAt: '2026-01-03T00:00:00.000Z', weight: '6.2g', rating: 4.7, reviews: 28
  },
  {
    id: 'p_seed_4', name: 'Kandyan Bridal Set', category: 'Bridal',
    description: 'Complete Kandyan bridal jewellery set including necklace, earrings, bangles, and maang tikka in 22k gold with rubies and pearls.',
    price: 850000, discountedPrice: 750000, specialOffer: 'Bridal Season Offer',
    offerExpiry: '2026-06-30',
    images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80'],
    metal: '22K Gold', gemstone: 'Ruby & Pearl', inStock: true, featured: true,
    createdAt: '2026-01-04T00:00:00.000Z', weight: '85g', rating: 5.0, reviews: 15
  },
  {
    id: 'p_seed_5', name: 'Sapphire Tennis Bracelet', category: 'Bracelets',
    description: 'Elegant tennis bracelet with alternating Ceylon sapphires and white diamonds set in 18k white gold.',
    price: 195000, discountedPrice: 175000, specialOffer: '',
    offerExpiry: '',
    images: ['https://images.unsplash.com/photo-1575377222312-dd1a63a51638?w=600&q=80'],
    metal: '18K White Gold', gemstone: 'Ceylon Sapphire & Diamond', inStock: true, featured: false,
    createdAt: '2026-01-05T00:00:00.000Z', weight: '15g', rating: 4.6, reviews: 22
  },
  {
    id: 'p_seed_6', name: "Cat's Eye Gent Ring", category: 'Rings',
    description: "Bold gentleman's ring featuring a prized Cat's Eye Chrysoberyl in a heavy 22k gold setting with traditional engravings.",
    price: 125000, discountedPrice: 125000, specialOffer: '',
    offerExpiry: '',
    images: ['https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&q=80'],
    metal: '22K Gold', gemstone: "Cat's Eye Chrysoberyl", inStock: true, featured: false,
    createdAt: '2026-01-06T00:00:00.000Z', weight: '18g', rating: 4.5, reviews: 19
  },
  {
    id: 'p_seed_7', name: 'Pearl Drop Earrings', category: 'Earrings',
    description: 'Classic South Sea pearl drop earrings with 22k gold hooks adorned with seed diamonds and fine filigree.',
    price: 75000, discountedPrice: 65000, specialOffer: '13% Off',
    offerExpiry: '2026-04-20',
    images: ['https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?w=600&q=80'],
    metal: '22K Gold', gemstone: 'South Sea Pearl', inStock: true, featured: false,
    createdAt: '2026-01-07T00:00:00.000Z', weight: '4.5g', rating: 4.7, reviews: 38
  },
  {
    id: 'p_seed_8', name: 'Blue Topaz Pendant', category: 'Necklaces',
    description: 'Faceted Swiss Blue Topaz in a prong-set 18k gold pendant with a delicate box chain.',
    price: 55000, discountedPrice: 48000, specialOffer: '',
    offerExpiry: '',
    images: ['https://images.unsplash.com/photo-1531995811006-35cb42e1a022?w=600&q=80'],
    metal: '18K Gold', gemstone: 'Swiss Blue Topaz', inStock: true, featured: false,
    createdAt: '2026-01-08T00:00:00.000Z', weight: '5g', rating: 4.4, reviews: 12
  },
  {
    id: 'p_seed_9', name: 'Amethyst Cluster Ring', category: 'Rings',
    description: 'Stunning cluster ring with deep purple amethysts set in 18k white gold, an elegant everyday luxury.',
    price: 68000, discountedPrice: 60000, specialOffer: 'New Arrival',
    offerExpiry: '2026-05-01',
    images: ['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&q=80'],
    metal: '18K White Gold', gemstone: 'Amethyst', inStock: true, featured: false,
    createdAt: '2026-01-09T00:00:00.000Z', weight: '7g', rating: 4.5, reviews: 9
  },
  {
    id: 'p_seed_10', name: 'Diamond Solitaire Ring', category: 'Rings',
    description: 'Timeless 1ct G-VS2 diamond solitaire ring in a 6-prong platinum setting. The perfect engagement ring.',
    price: 450000, discountedPrice: 420000, specialOffer: '',
    offerExpiry: '',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'],
    metal: 'Platinum', gemstone: 'Diamond', inStock: true, featured: true,
    createdAt: '2026-01-10T00:00:00.000Z', weight: '5g', rating: 5.0, reviews: 67
  },
  {
    id: 'p_seed_11', name: 'Gold Bangle Set', category: 'Bracelets',
    description: 'Set of 4 traditional Kandyan plain gold bangles with fine engraved Kandyan border pattern, sold as a set.',
    price: 95000, discountedPrice: 88000, specialOffer: '',
    offerExpiry: '',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'],
    metal: '22K Gold', gemstone: 'None', inStock: true, featured: false,
    createdAt: '2026-01-11T00:00:00.000Z', weight: '35g', rating: 4.6, reviews: 41
  },
  {
    id: 'p_seed_12', name: 'Moonstone Silver Pendant', category: 'Necklaces',
    description: 'Mystical rainbow moonstone set in fine sterling silver with oxidised Kandyan lotus detailing.',
    price: 18500, discountedPrice: 15000, specialOffer: '19% Off',
    offerExpiry: '2026-04-15',
    images: ['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80'],
    metal: 'Sterling Silver', gemstone: 'Rainbow Moonstone', inStock: true, featured: false,
    createdAt: '2026-01-12T00:00:00.000Z', weight: '3g', rating: 4.8, reviews: 55
  },
];

/* ── Auto-seed if Firestore is empty ─────────────────── */
async function _seedIfEmpty() {
  const snap = await getDocs(collection(_db, COL));
  if (snap.empty) {
    console.log('[KGJ] Seeding products to Firestore...');
    for (const p of SEED) {
      const { id, ...data } = p;
      await setDoc(doc(_db, COL, id), data);
    }
    console.log('[KGJ] Seed complete.');
    return SEED;
  }
  return null;
}

/* ── Load all products from Firestore ────────────────── */
async function fsLoadProducts() {
  try {
    let snap = await getDocs(collection(_db, COL));
    if (snap.empty) {
      console.log('[KGJ] Firestore empty, seeding defaults...');
      await _seedIfEmpty();
      snap = await getDocs(collection(_db, COL));
    }
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    products.sort((a,b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    if (products.length > 0) {
      window._FSProducts = products;
      return products;
    }
    return null; // Force fallback if still empty
  } catch (e) {
    console.error('[KGJ] Firestore products load failed:', e);
    return null;
  }
}

/* ── Add a new product ───────────────────────────────── */
async function fsAddProduct(data) {
  const docData = { ...data, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(_db, COL), docData);
  return { id: ref.id, ...docData };
}

/* ── Update an existing product ──────────────────────── */
async function fsUpdateProduct(id, data) {
  await setDoc(doc(_db, COL, id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

/* ── Delete a product ────────────────────────────────── */
async function fsDeleteProduct(id) {
  await deleteDoc(doc(_db, COL, id));
}

/* ── Expose on window.KGJ for non-module scripts ─────── */
window.KGJ = window.KGJ || {};
Object.assign(window.KGJ, {
  fsLoadProducts,
  fsAddProduct,
  fsUpdateProduct,
  fsDeleteProduct,
});
