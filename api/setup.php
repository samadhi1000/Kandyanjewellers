<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — First-Run Setup
   Visit this URL once after upload to create tables
   e.g. https://yourdomain.com/api/setup.php
   ===================================================== */
require_once 'config.php';

$db = getDB();

// ── Create Tables ──────────────────────────────────
$db->exec("
CREATE TABLE IF NOT EXISTS products (
    id           VARCHAR(36) PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    category     VARCHAR(100) NOT NULL,
    description  TEXT,
    price        DECIMAL(12,2) NOT NULL DEFAULT 0,
    discounted_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    special_offer VARCHAR(100) DEFAULT '',
    offer_expiry  DATE DEFAULT NULL,
    image_url    VARCHAR(500) DEFAULT '',
    metal        VARCHAR(100) DEFAULT '',
    gemstone     VARCHAR(100) DEFAULT '',
    weight       VARCHAR(50) DEFAULT '',
    in_stock     TINYINT(1) DEFAULT 1,
    featured     TINYINT(1) DEFAULT 0,
    rating       DECIMAL(3,1) DEFAULT 4.5,
    reviews      INT DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
CREATE TABLE IF NOT EXISTS orders (
    id           VARCHAR(30) PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(200),
    customer_address TEXT,
    items        JSON NOT NULL,
    subtotal     DECIMAL(12,2) DEFAULT 0,
    delivery     DECIMAL(12,2) DEFAULT 0,
    total        DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cod',
    status       VARCHAR(50) DEFAULT 'pending',
    notes        TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
CREATE TABLE IF NOT EXISTS settings (
    setting_key  VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
CREATE TABLE IF NOT EXISTS admin_users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(100) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
CREATE TABLE IF NOT EXISTS admin_sessions (
    token      VARCHAR(64) PRIMARY KEY,
    admin_id   INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// ── Seed Default Admin ─────────────────────────────
$existingAdmin = $db->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
if ($existingAdmin == 0) {
    $stmt = $db->prepare('INSERT INTO admin_users (username, password) VALUES (?, ?)');
    $stmt->execute(['admin', password_hash('kandyan2024', PASSWORD_DEFAULT)]);
}

// ── Seed Default Settings ──────────────────────────
$defaults = [
    'siteName'       => 'Kandyan Gem & Jewellers',
    'tagline'        => 'Timeless Kandyan Craftsmanship Since 1985',
    'heroTitle'      => 'Where Every Gem Tells a Story',
    'heroSubtitle'   => 'Handcrafted Kandyan jewellery of unparalleled quality',
    'heroCtaText'    => 'Explore Collection',
    'phone'          => '+94 81 234 5678',
    'whatsapp'       => '+94 77 123 4567',
    'email'          => 'info@kandyangemandjewellers.lk',
    'address'        => 'No. 42, Peradeniya Road, Kandy 20000, Sri Lanka',
    'facebook'       => 'https://facebook.com',
    'instagram'      => 'https://instagram.com',
    'heroBg'         => 'images/hero.jpg',
    'gemsBg'         => 'images/gems-bg.jpg',
    'aboutBg'        => 'images/about-bg.jpg',
    'collectionBg'   => 'images/collection-banner.jpg',
    'offerBanner'    => 'Free shipping on orders over Rs. 15,000 | Certified Authentic Gems | 30-Day Returns',
    'deliveryCharge' => '350',
];
$stmt = $db->prepare('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)');
foreach ($defaults as $key => $val) {
    $stmt->execute([$key, $val]);
}

// ── Seed Default Products ──────────────────────────
$existingProducts = $db->query('SELECT COUNT(*) FROM products')->fetchColumn();
if ($existingProducts == 0) {
    $seeds = [
        ['p_seed_1', 'Royal Sapphire Ring', 'Rings', 'A breathtaking 3ct Ceylon Blue Sapphire set in 22k gold with intricate Kandyan filigree work.', 185000, 165000, 'Valentine Special', '2026-12-31', 'images/hero.jpg', '22K Gold', 'Ceylon Blue Sapphire', '8.5g', 1, 1, 4.9, 47],
        ['p_seed_2', 'Ruby Pendant Necklace', 'Necklaces', 'Stunning Burmese ruby pendant set in 18k rose gold with diamond halo.', 245000, 245000, '', null, 'images/collection-banner.jpg', '18K Rose Gold', 'Burmese Ruby', '12g', 1, 1, 4.8, 31],
        ['p_seed_3', 'Emerald Cascade Earrings', 'Earrings', 'Exquisite drop earrings featuring Colombian emeralds in a traditional Kandyan gold setting.', 135000, 118000, '12% Off', '2026-12-31', 'images/gems-bg.jpg', '21K Gold', 'Colombian Emerald', '6.2g', 1, 1, 4.7, 28],
        ['p_seed_4', 'Kandyan Bridal Set', 'Bridal', 'Complete Kandyan bridal jewellery set including necklace, earrings, bangles, and maang tikka in 22k gold.', 850000, 750000, 'Bridal Season Offer', '2026-12-31', 'images/about-bg.jpg', '22K Gold', 'Ruby & Pearl', '85g', 1, 1, 5.0, 15],
        ['p_seed_5', 'Sapphire Tennis Bracelet', 'Bracelets', 'Elegant tennis bracelet with alternating Ceylon sapphires and white diamonds in 18k white gold.', 195000, 175000, '', null, 'images/collection-banner.jpg', '18K White Gold', 'Ceylon Sapphire & Diamond', '15g', 1, 0, 4.6, 22],
        ['p_seed_6', "Cat's Eye Gent Ring", 'Rings', "Bold gentleman's ring featuring a prized Cat's Eye Chrysoberyl in 22k gold.", 125000, 125000, '', null, 'images/gems-bg.jpg', '22K Gold', "Cat's Eye Chrysoberyl", '18g', 1, 0, 4.5, 19],
        ['p_seed_7', 'Pearl Drop Earrings', 'Earrings', 'Classic South Sea pearl drop earrings with 22k gold hooks and fine filigree.', 75000, 65000, '13% Off', '2026-12-31', 'images/hero.jpg', '22K Gold', 'South Sea Pearl', '4.5g', 1, 0, 4.7, 38],
        ['p_seed_8', 'Blue Topaz Pendant', 'Necklaces', 'Faceted Swiss Blue Topaz in a prong-set 18k gold pendant with a delicate box chain.', 55000, 48000, '', null, 'images/about-bg.jpg', '18K Gold', 'Swiss Blue Topaz', '5g', 1, 0, 4.4, 12],
        ['p_seed_9', 'Amethyst Cluster Ring', 'Rings', 'Stunning cluster ring with deep purple amethysts set in 18k white gold.', 68000, 60000, 'New Arrival', '2026-12-31', 'images/collection-banner.jpg', '18K White Gold', 'Amethyst', '7g', 1, 0, 4.5, 9],
        ['p_seed_10', 'Diamond Solitaire Ring', 'Rings', 'Timeless 1ct G-VS2 diamond solitaire ring in a 6-prong platinum setting.', 450000, 420000, '', null, 'images/gems-bg.jpg', 'Platinum', 'Diamond', '5g', 1, 1, 5.0, 67],
        ['p_seed_11', 'Gold Bangle Set', 'Bracelets', 'Set of 4 traditional Kandyan plain gold bangles with fine engraved Kandyan border pattern.', 95000, 88000, '', null, 'images/hero.jpg', '22K Gold', 'None', '35g', 1, 0, 4.6, 41],
        ['p_seed_12', 'Moonstone Silver Pendant', 'Necklaces', 'Mystical rainbow moonstone set in fine sterling silver with oxidised Kandyan lotus detailing.', 18500, 15000, '19% Off', '2026-12-31', 'images/about-bg.jpg', 'Sterling Silver', 'Rainbow Moonstone', '3g', 1, 0, 4.8, 55],
    ];
    $stmt = $db->prepare('INSERT INTO products (id, name, category, description, price, discounted_price, special_offer, offer_expiry, image_url, metal, gemstone, weight, in_stock, featured, rating, reviews) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    foreach ($seeds as $s) {
        $stmt->execute($s);
    }
}

// ── Done ───────────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');
echo '<h2 style="font-family:sans-serif;color:green">✅ Setup Complete!</h2>';
echo '<p style="font-family:sans-serif">Tables created. Default products, settings & admin seeded.</p>';
echo '<p style="font-family:sans-serif"><strong>Default Admin Login:</strong> Username: <code>admin</code> | Password: <code>kandyan2024</code></p>';
echo '<p style="font-family:sans-serif" style="color:red">⚠️ Delete or rename this file after setup for security!</p>';
echo '<p style="font-family:sans-serif"><a href="../admin/">Go to Admin Panel →</a></p>';
