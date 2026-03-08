<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — Admin Auth API
   POST action=login  → validate credentials, return token
   POST action=logout → delete session token
   GET  action=check  → validate existing token
   ===================================================== */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET: check token validity ──────────────────────
if ($method === 'GET') {
    $token = $_GET['token'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (!$token) respond(['valid' => false]);
    $stmt = $db->prepare('SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()');
    $stmt->execute([$token]);
    respond(['valid' => (bool)$stmt->fetch()]);
}

// ── POST ───────────────────────────────────────────
if ($method === 'POST') {
    $b      = getBody();
    $action = $b['action'] ?? '';

    // Login
    if ($action === 'login') {
        $username = $b['username'] ?? '';
        $password = $b['password'] ?? '';
        if (!$username || !$password) respond(['error' => 'Missing credentials'], 400);

        $stmt = $db->prepare('SELECT id, password FROM admin_users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) respond(['error' => 'Invalid credentials'], 401);

        // Support both hashed (new) and plain (legacy migration) passwords
        $valid = password_verify($password, $user['password'])
              || ($password === $user['password']); // plain text fallback

        if (!$valid) respond(['error' => 'Invalid credentials'], 401);

        // Create session token (24h)
        $token  = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 86400);

        // Clean old sessions for this user
        $db->prepare('DELETE FROM admin_sessions WHERE admin_id = ?')->execute([$user['id']]);

        $stmt = $db->prepare('INSERT INTO admin_sessions (token, admin_id, expires_at) VALUES (?,?,?)');
        $stmt->execute([$token, $user['id'], $expiry]);

        respond(['success' => true, 'token' => $token, 'expires' => $expiry]);
    }

    // Logout
    if ($action === 'logout') {
        $token = $b['token'] ?? '';
        if ($token) {
            $db->prepare('DELETE FROM admin_sessions WHERE token = ?')->execute([$token]);
        }
        respond(['success' => true]);
    }

    // Change password
    if ($action === 'change_password') {
        requireAdmin();
        $newUser = $b['username'] ?? '';
        $newPass = $b['password'] ?? '';
        if (!$newUser || !$newPass || strlen($newPass) < 6) {
            respond(['error' => 'Invalid data'], 400);
        }
        $hashed = password_hash($newPass, PASSWORD_DEFAULT);
        $stmt = $db->prepare('UPDATE admin_users SET username=?, password=? WHERE id=1');
        $stmt->execute([$newUser, $hashed]);
        // Invalidate all sessions
        $db->exec('DELETE FROM admin_sessions');
        respond(['success' => true]);
    }

    respond(['error' => 'Unknown action'], 400);
}
