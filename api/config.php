<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — Database Configuration
   =====================================================
   Fill these in from cPanel → MySQL Databases
   ===================================================== */

define('DB_HOST', 'localhost');        // Usually 'localhost' on cPanel
define('DB_NAME', 'your_db_name');     // e.g. kandyan_jewellery
define('DB_USER', 'your_db_user');     // e.g. cpanelusername_kandyan
define('DB_PASS', 'your_db_password'); // Your MySQL password

/* ── CORS & JSON Headers ── */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* ── PDO Connection ── */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
    return $pdo;
}

/* ── Helper: respond with JSON ── */
function respond(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

/* ── Helper: get JSON body ── */
function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/* ── Admin session check ── */
function requireAdmin(): void {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ($_COOKIE['kgj_admin_token'] ?? '');
    if (empty($token)) {
        respond(['error' => 'Unauthorized'], 401);
    }
    $db = getDB();
    $stmt = $db->prepare('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()');
    $stmt->execute([$token]);
    if (!$stmt->fetch()) {
        respond(['error' => 'Unauthorized'], 401);
    }
}
