<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — Settings API
   GET  → return all settings as JSON object
   POST → save/update settings
   ===================================================== */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET: return settings ───────────────────────────
if ($method === 'GET') {
    $stmt = $db->query('SELECT setting_key, setting_value FROM settings');
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    respond($settings);
}

// ── POST: save settings ────────────────────────────
if ($method === 'POST') {
    requireAdmin();
    $b = getBody();
    $stmt = $db->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
    foreach ($b as $key => $val) {
        $stmt->execute([$key, (string)$val]);
    }
    respond(['success' => true]);
}
