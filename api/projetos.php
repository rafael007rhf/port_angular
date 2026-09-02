<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!in_array($metodo, ['GET', 'POST', 'PUT', 'DELETE'], true)) {
    http_response_code(405);
    echo json_encode(['erro' => 'Metodo nao permitido']);
    exit;
}

if ($metodo === 'GET') {
    require __DIR__ . '/../conexao.php';

    $todos = isset($_GET['todos']) && $_GET['todos'] === '1';
    $campos = 'id, nome, descricao, tecnologias, link_github, ano, status';

    if ($todos) {
        $sql = "SELECT $campos FROM projetos ORDER BY ano DESC, id";
    } else {
        $sql = "SELECT $campos FROM projetos WHERE status = 'publicado' ORDER BY ano DESC, id";
    }

    $projetos = $pdo->query($sql)->fetchAll();
    echo json_encode($projetos, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $dados = is_array($dados) ? $dados : [];

    $nome = trim($dados['nome'] ?? '');
    $descricao = trim($dados['descricao'] ?? '');
    $tecnologias = trim($dados['tecnologias'] ?? '');
    $linkGithub = trim($dados['link_github'] ?? '');
    $ano = (int) ($dados['ano'] ?? 0);
    $status = $dados['status'] ?? 'publicado';

    if ($nome === '') {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe pelo menos o nome do projeto']);
        exit;
    }

    if ($ano < 1) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe o ano do projeto']);
        exit;
    }

    if (!in_array($status, ['rascunho', 'publicado'], true)) {
        $status = 'rascunho';
    }

    require __DIR__ . '/../conexao.php';

    $sql = 'INSERT INTO projetos (nome, descricao, tecnologias, link_github, ano, status)
            VALUES (?, ?, ?, ?, ?, ?)';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nome, $descricao, $tecnologias, $linkGithub, $ano, $status]);

    http_response_code(201);
    echo json_encode(['id' => (int) $pdo->lastInsertId()]);
    exit;
}

if ($metodo === 'PUT') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

    if (!$id || $id < 1) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe um id valido']);
        exit;
    }

    $dados = json_decode(file_get_contents('php://input'), true);
    $dados = is_array($dados) ? $dados : [];

    $nome = trim($dados['nome'] ?? '');
    $descricao = trim($dados['descricao'] ?? '');
    $tecnologias = trim($dados['tecnologias'] ?? '');
    $linkGithub = trim($dados['link_github'] ?? '');
    $ano = (int) ($dados['ano'] ?? 0);
    $status = $dados['status'] ?? 'rascunho';

    if ($nome === '') {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe pelo menos o nome do projeto']);
        exit;
    }

    if ($ano < 1) {
        http_response_code(400);
        echo json_encode(['erro' => 'Informe o ano do projeto']);
        exit;
    }

    if (!in_array($status, ['rascunho', 'publicado'], true)) {
        $status = 'rascunho';
    }

    require __DIR__ . '/../conexao.php';

    $sql = 'UPDATE projetos
            SET nome = ?, descricao = ?, tecnologias = ?, link_github = ?, ano = ?, status = ?
            WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nome, $descricao, $tecnologias, $linkGithub, $ano, $status, $id]);

    if ($stmt->rowCount() === 0) {
        $verificacao = $pdo->prepare('SELECT id FROM projetos WHERE id = ?');
        $verificacao->execute([$id]);

        if (!$verificacao->fetch()) {
            http_response_code(404);
            echo json_encode(['erro' => 'Projeto nao encontrado']);
            exit;
        }
    }

    http_response_code(200);
    echo json_encode(['mensagem' => 'Projeto atualizado']);
    exit;
}

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id || $id < 1) {
    http_response_code(400);
    echo json_encode(['erro' => 'Informe um id valido']);
    exit;
}

require __DIR__ . '/../conexao.php';

$stmt = $pdo->prepare('DELETE FROM projetos WHERE id = ?');
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['erro' => 'Projeto nao encontrado']);
    exit;
}

http_response_code(204);
