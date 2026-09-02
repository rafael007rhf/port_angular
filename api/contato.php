<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($metodo !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Metodo nao permitido']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$dados = is_array($dados) ? $dados : [];

$nome = trim($dados['nome'] ?? '');
$email = trim($dados['email'] ?? '');
$mensagem = trim($dados['mensagem'] ?? '');
$erros = [];

if ($nome === '') {
    $erros[] = 'Informe o nome.';
}

if ($email === '') {
    $erros[] = 'Informe o e-mail.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'Informe um e-mail valido.';
}

if (strlen($mensagem) < 10) {
    $erros[] = 'A mensagem deve ter no minimo 10 caracteres.';
}

if ($erros) {
    http_response_code(400);
    echo json_encode(['erros' => $erros], JSON_UNESCAPED_UNICODE);
    exit;
}

require __DIR__ . '/../conexao.php';

$sql = 'INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)';
$stmt = $pdo->prepare($sql);
$stmt->execute([$nome, $email, $mensagem]);

http_response_code(201);
echo json_encode([
    'sucesso' => true,
    'id' => (int) $pdo->lastInsertId(),
    'mensagem' => 'Contato recebido com sucesso!',
], JSON_UNESCAPED_UNICODE);
