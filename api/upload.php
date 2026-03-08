<?php
/* =====================================================
   KANDYAN GEM & JEWELLERS — Image Upload API
   POST (multipart) → save image → return filename/URL
   ===================================================== */
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

requireAdmin();

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    respond(['error' => 'No image uploaded or upload error'], 400);
}

$file     = $_FILES['image'];
$allowed  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
$mimeType = mime_content_type($file['tmp_name']);

if (!in_array($mimeType, $allowed)) {
    respond(['error' => 'Invalid file type. Allowed: JPG, PNG, WebP, GIF'], 400);
}

// Max 10MB
if ($file['size'] > 10 * 1024 * 1024) {
    respond(['error' => 'File too large. Max 10MB'], 400);
}

// Target folder: images/ (one level up from api/)
$uploadDir = dirname(__DIR__) . '/images/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Unique filename
$ext      = match($mimeType) {
    'image/jpeg', 'image/jpg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    default      => 'jpg',
};
$filename = 'product_' . uniqid() . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    respond(['error' => 'Failed to save file'], 500);
}

// Return the relative path (as used in <img src>)
respond([
    'success'  => true,
    'filename' => $filename,
    'url'      => 'images/' . $filename,
]);
