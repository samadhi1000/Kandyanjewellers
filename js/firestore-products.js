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

/* ── Auto-seed / sync all products from SEED list ─────── */
async function _seedIfEmpty() {
  const snap = await getDocs(collection(_db, COL));

  // Detect and remove old seed products (pre-new format)
  let hasOldSeed = false;
  snap.forEach(d => {
    if (d.id.startsWith('p_seed_') && !d.id.startsWith('p_seed_new_')) {
      hasOldSeed = true;
    }
  });
  if (hasOldSeed) {
    console.log('[KGJ] Old seed detected, clearing collection...');
    for (const d of snap.docs) {
      await deleteDoc(doc(_db, COL, d.id));
    }
    console.log('[KGJ] Cleared. Seeding new products...');
    for (const p of SEED) {
      const { id, ...data } = p;
      await setDoc(doc(_db, COL, id), data);
    }
    console.log('[KGJ] Seed complete.');
    return SEED;
  }

  if (snap.empty) {
    // Collection is empty — seed everything
    console.log('[KGJ] Seeding products to Firestore...');
    for (const p of SEED) {
      const { id, ...data } = p;
      await setDoc(doc(_db, COL, id), data);
    }
    console.log('[KGJ] Seed complete.');
    return SEED;
  }

  // Collection has data — upsert any SEED products that are missing
  const existingIds = new Set(snap.docs.map(d => d.id));
  const missing = SEED.filter(p => !existingIds.has(p.id));
  if (missing.length > 0) {
    console.log(`[KGJ] Adding ${missing.length} missing products to Firestore...`);
    for (const p of missing) {
      const { id, ...data } = p;
      await setDoc(doc(_db, COL, id), data);
    }
    console.log('[KGJ] Missing products added.');
    return SEED;
  }

  return null;
}

/* ── Load all products from Firestore ────────────────── */
async function fsLoadProducts() {
  try {
    // Always sync missing seed products first
    const synced = await _seedIfEmpty();

    let snap = await getDocs(collection(_db, COL));
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
