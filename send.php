<?php
// Receives the Contact form and emails it to the team.
// 1) Put the team's real email address below. 2) Keep this file next to index.html.
$TO = 'hybrutos@example.com';

header('Content-Type: application/json; charset=utf-8');
function out($ok, $code = 200) { http_response_code($code); echo json_encode(['ok' => $ok]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 405);
if (!empty($_POST['website'])) out(true);               // honeypot: bots fill this in

$clean = function ($v) { return trim(preg_replace('/[\r\n]+/', ' ', strip_tags((string)$v))); };
$name  = $clean($_POST['n'] ?? '');
$email = trim((string)($_POST['e'] ?? ''));
$topic = $clean($_POST['t'] ?? 'Message');
$msg   = trim(strip_tags((string)($_POST['m'] ?? '')));

if ($name === '' || $msg === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 400);
if (mb_strlen($msg) > 5000 || mb_strlen($name) > 200) out(false, 400);

$host    = preg_replace('/^www\./', '', preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
$subject = '=?UTF-8?B?' . base64_encode('Hybrutos Racing website: ' . $topic) . '?=';
$body    = "Name: $name\nEmail: $email\nAbout: $topic\n\n$msg\n";
$headers = [
  'From: Hybrutos Racing Website <no-reply@' . $host . '>',
  'Reply-To: ' . $email,
  'Content-Type: text/plain; charset=UTF-8',
];
$sent = mail($TO, $subject, $body, implode("\r\n", $headers));
out($sent, $sent ? 200 : 500);
