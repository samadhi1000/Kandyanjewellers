<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — Orders API
   GET    → all orders (admin) or single order
   POST   → save new order (checkout)
   PUT    → update order status (admin)
   ===================================================== */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ────────────────────────────────────────────
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        // Single order (for receipt)
        $stmt = $db->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$_GET['id']]);
        $order = $stmt->fetch();
        if (!$order) respond(['error' => 'Not found'], 404);
        respond(formatOrder($order));
    }
    // All orders — admin only
    requireAdmin();
    $stmt = $db->query('SELECT * FROM orders ORDER BY created_at DESC');
    respond(array_map('formatOrder', $stmt->fetchAll()));
}

// ── POST: save new order (from checkout page) ──────
if ($method === 'POST') {
    $b = getBody();

    // Generate order ID
    $id = 'ORD-' . strtoupper(base_convert(time(), 10, 36));

    $stmt = $db->prepare('
        INSERT INTO orders (id, customer_name, customer_phone, customer_email,
            customer_address, items, subtotal, delivery, total, payment_method, notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ');
    $stmt->execute([
        $id,
        $b['name']           ?? '',
        $b['phone']          ?? '',
        $b['email']          ?? '',
        $b['address']        ?? '',
        json_encode($b['items'] ?? []),
        $b['subtotal']       ?? 0,
        $b['delivery']       ?? 350,
        $b['total']          ?? 0,
        $b['paymentMethod']  ?? 'cod',
        $b['notes']          ?? '',
    ]);

    $order = $db->query("SELECT * FROM orders WHERE id = " . $db->quote($id))->fetch();
    respond(formatOrder($order), 201);
}

// ── PUT: update order status ───────────────────────
if ($method === 'PUT') {
    requireAdmin();
    $b      = getBody();
    $id     = $b['id']     ?? '';
    $status = $b['status'] ?? '';
    if (!$id || !$status) respond(['error' => 'Missing id or status'], 400);

    $stmt = $db->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);
    respond(['success' => true]);
}

/* ── Helper ── */
function formatOrder(array $row): array {
    return [
        'id'              => $row['id'],
        'name'            => $row['customer_name'],
        'phone'           => $row['customer_phone'],
        'email'           => $row['customer_email'],
        'address'         => $row['customer_address'],
        'items'           => json_decode($row['items'], true),
        'subtotal'        => (float)$row['subtotal'],
        'delivery'        => (float)$row['delivery'],
        'total'           => (float)$row['total'],
        'paymentMethod'   => $row['payment_method'],
        'status'          => $row['status'],
        'notes'           => $row['notes'],
        'createdAt'       => $row['created_at'],
    ];
}
