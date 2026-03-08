<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — Products API
   GET    → all products
   POST   → add product (admin)
   PUT    → update product (admin)
   DELETE → delete product (admin)
   ===================================================== */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET: return all products ───────────────────────
if ($method === 'GET') {
    $stmt = $db->query('SELECT * FROM products ORDER BY created_at DESC');
    $rows = $stmt->fetchAll();
    $products = array_map('formatProduct', $rows);
    respond($products);
}

// ── POST: add new product ──────────────────────────
if ($method === 'POST') {
    requireAdmin();
    $b = getBody();
    $id = 'p_' . uniqid() . '_' . substr(md5(rand()), 0, 5);
    $stmt = $db->prepare('
        INSERT INTO products (id, name, category, description, price, discounted_price,
            special_offer, offer_expiry, image_url, metal, gemstone, weight,
            in_stock, featured, rating, reviews)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $id,
        $b['name']           ?? '',
        $b['category']       ?? '',
        $b['description']    ?? '',
        $b['price']          ?? 0,
        $b['discountedPrice'] ?? $b['price'] ?? 0,
        $b['specialOffer']   ?? '',
        normalizeDate($b['offerExpiry'] ?? ''),
        $b['images'][0]      ?? $b['image_url'] ?? '',
        $b['metal']          ?? '',
        $b['gemstone']       ?? '',
        $b['weight']         ?? '',
        isset($b['inStock'])  ? (int)$b['inStock']  : 1,
        isset($b['featured']) ? (int)$b['featured'] : 0,
        $b['rating']         ?? 4.8,
        $b['reviews']        ?? 0,
    ]);
    $product = $db->query("SELECT * FROM products WHERE id = '$id'")->fetch();
    respond(formatProduct($product), 201);
}

// ── PUT: update product ────────────────────────────
if ($method === 'PUT') {
    requireAdmin();
    $b  = getBody();
    $id = $b['id'] ?? '';
    if (!$id) respond(['error' => 'Missing id'], 400);

    $stmt = $db->prepare('
        UPDATE products SET
            name=?, category=?, description=?, price=?, discounted_price=?,
            special_offer=?, offer_expiry=?, image_url=?, metal=?, gemstone=?,
            weight=?, in_stock=?, featured=?
        WHERE id=?
    ');
    $stmt->execute([
        $b['name']            ?? '',
        $b['category']        ?? '',
        $b['description']     ?? '',
        $b['price']           ?? 0,
        $b['discountedPrice'] ?? $b['price'] ?? 0,
        $b['specialOffer']    ?? '',
        normalizeDate($b['offerExpiry'] ?? ''),
        $b['images'][0]       ?? $b['image_url'] ?? '',
        $b['metal']           ?? '',
        $b['gemstone']        ?? '',
        $b['weight']          ?? '',
        isset($b['inStock'])  ? (int)$b['inStock']  : 1,
        isset($b['featured']) ? (int)$b['featured'] : 0,
        $id,
    ]);
    $product = $db->query("SELECT * FROM products WHERE id = " . $db->quote($id))->fetch();
    respond(formatProduct($product));
}

// ── DELETE: delete product ─────────────────────────
if ($method === 'DELETE') {
    requireAdmin();
    $id = $_GET['id'] ?? '';
    if (!$id) respond(['error' => 'Missing id'], 400);
    $stmt = $db->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    respond(['success' => true]);
}

/* ── Helpers ── */
function formatProduct(array $row): array {
    return [
        'id'             => $row['id'],
        'name'           => $row['name'],
        'category'       => $row['category'],
        'description'    => $row['description'],
        'price'          => (float)$row['price'],
        'discountedPrice'=> (float)$row['discounted_price'],
        'specialOffer'   => $row['special_offer'],
        'offerExpiry'    => $row['offer_expiry'],
        'images'         => [$row['image_url']],
        'image_url'      => $row['image_url'],
        'metal'          => $row['metal'],
        'gemstone'       => $row['gemstone'],
        'weight'         => $row['weight'],
        'inStock'        => (bool)$row['in_stock'],
        'featured'       => (bool)$row['featured'],
        'rating'         => (float)$row['rating'],
        'reviews'        => (int)$row['reviews'],
        'createdAt'      => $row['created_at'],
    ];
}

function normalizeDate(string $d): ?string {
    return ($d && $d !== '') ? $d : null;
}
