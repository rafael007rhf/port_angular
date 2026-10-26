const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const app = require('../server');

// Integração real: exige um banco preparado com setup.sql e usuarios.sql.
// Somente registros deste teste são removidos; o seed não é apagado.
test('contrato HTTP, persistência e autenticação com MariaDB', async (t) => {
  const email = `teste-${randomBytes(6).toString('hex')}@example.test`;
  const senha = randomBytes(24).toString('hex');
  const idsProjetos = [];
  const idsTecnologias = [];
  const idsContatos = [];
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  t.after(async () => {
    for (const id of idsProjetos) await pool.execute('DELETE FROM projetos WHERE id = ?', [id]);
    for (const id of idsTecnologias) await pool.execute('DELETE FROM tecnologias WHERE id = ?', [id]);
    for (const id of idsContatos) await pool.execute('DELETE FROM contatos WHERE id = ?', [id]);
    await pool.execute('DELETE FROM usuarios WHERE email = ?', [email]);
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });
  const hash = await bcrypt.hash(senha, 10);
  await pool.execute('INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)', [email, hash]);
  let token;
  async function pedido(caminho, { method = 'GET', body, auth = false, headers = {} } = {}) {
    const res = await fetch(base + caminho, {
      method,
      headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(auth ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const texto = await res.text();
    return { status: res.status, body: texto ? JSON.parse(texto) : null, headers: res.headers };
  }
  await t.test('GET público mantém seis campos e só mostra publicados', async () => {
    const res = await pedido('/projetos');
    assert.equal(res.status, 200);
    assert.ok(res.body.length > 0);
    assert.deepEqual(Object.keys(res.body[0]).sort(), ['id','nome','descricao','tecnologias','link_github','ano'].sort());
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
    assert.equal((await pedido('/projetos/1')).status, 200);
    assert.equal((await pedido('/projetos/6')).status, 404);
    assert.equal((await pedido('/projetos/99999999')).status, 404);
    assert.equal((await pedido('/tecnologias')).status, 200);
  });
  await t.test('todas as seis escritas e /todos exigem Bearer', async () => {
    for (const raiz of ['projetos','tecnologias']) {
      for (const method of ['POST','PUT','DELETE']) {
        const res = await pedido(`/${raiz}${method === 'POST' ? '' : '/1'}`, { method, body: method === 'DELETE' ? undefined : { nome: 'Bloqueado' } });
        assert.equal(res.status, 401, method + raiz);
      }
    }
    assert.equal((await pedido('/projetos/todos')).status, 401);
    assert.equal((await pedido('/projetos/todos', { headers: { Authorization: 'Bearer adulterado' } })).status, 401);
    const expirado = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
    assert.equal((await pedido('/projetos/todos', { headers: { Authorization: `Bearer ${expirado}` } })).status, 401);
  });
  await t.test('login: 400 sem senha, 401 igual para email/senha errados, 200 e 30m no correto', async () => {
    assert.equal((await pedido('/login', { method: 'POST', body: { email } })).status, 400);
    const errado = await pedido('/login', { method: 'POST', body: { email, senha: 'errada' } });
    const inexistente = await pedido('/login', { method: 'POST', body: { email: 'ninguem@example.test', senha } });
    assert.equal(errado.status, 401); assert.deepEqual(errado.body, inexistente.body);
    const certo = await pedido('/login', { method: 'POST', body: { email, senha } });
    assert.equal(certo.status, 200); token = certo.body.token;
    const conteudo = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(conteudo.exp - conteudo.iat, 1800);
    assert.equal(conteudo.email, email);
    assert.ok(!('senha' in conteudo));
    const [usuarios] = await pool.execute('SELECT senha_hash FROM usuarios WHERE email = ?', [email]);
    assert.notEqual(usuarios[0].senha_hash, senha); assert.match(usuarios[0].senha_hash, /^\$2/);
  });
  await t.test('POST, PUT idêntico, rascunho, /todos, SQL parametrizado e DELETE repetido', async () => {
    assert.equal((await pedido('/projetos', { method: 'POST', auth: true, body: {} })).status, 400);
    assert.equal((await pedido('/projetos', { method: 'POST', auth: true, body: { nome: '   ' } })).status, 400);
    assert.equal((await pedido('/projetos', { method: 'POST', auth: true, body: { nome: 'X', ano: 'texto' } })).status, 400);
    const projeto = { nome: "Projeto ' OR 1=1 --", descricao: 'Integração real', tecnologias: 'Node', ano: 2026, status: 'rascunho' };
    const criado = await pedido('/projetos', { method: 'POST', auth: true, body: projeto });
    assert.equal(criado.status, 201); idsProjetos.push(criado.body.id);
    const id = criado.body.id;
    assert.equal((await pedido(`/projetos/${id}`)).status, 404);
    assert.ok(!(await pedido('/projetos')).body.some((p) => p.id === id));
    const todos = await pedido('/projetos/todos', { auth: true });
    assert.equal(todos.status, 200); assert.equal(todos.body.find((p) => p.id === id).nome, projeto.nome);
    projeto.status = 'publicado';
    for (let i = 0; i < 2; i++) assert.equal((await pedido(`/projetos/${id}`, { method: 'PUT', auth: true, body: projeto })).status, 200);
    assert.equal((await pedido(`/projetos/${id}`)).body.nome, projeto.nome);
    assert.equal((await pedido('/projetos/99999999', { method: 'PUT', auth: true, body: projeto })).status, 404);
    const apagado = await pedido(`/projetos/${id}`, { method: 'DELETE', auth: true });
    assert.equal(apagado.status, 204); assert.equal(apagado.body, null);
    assert.equal((await pedido(`/projetos/${id}`, { method: 'DELETE', auth: true })).status, 404);
  });
  await t.test('catálogo: cria, altera, filtra inativo, apaga e valida os erros', async () => {
    assert.equal((await pedido('/tecnologias', { method: 'POST', auth: true, body: { nome: 'X' } })).status, 400);
    const tecnologia = { nome: 'Tecnologia de integração', categoria: 'Backend', ano_criacao: 2026 };
    const criado = await pedido('/tecnologias', { method: 'POST', auth: true, body: tecnologia });
    assert.equal(criado.status, 201); const id = criado.body.id; idsTecnologias.push(id);
    assert.ok((await pedido('/tecnologias')).body.some((item) => item.id === id));
    tecnologia.status = 'inativo';
    assert.equal((await pedido(`/tecnologias/${id}`, { method: 'PUT', auth: true, body: tecnologia })).status, 200);
    assert.ok(!(await pedido('/tecnologias')).body.some((item) => item.id === id));
    assert.equal((await pedido('/tecnologias/99999999', { method: 'PUT', auth: true, body: tecnologia })).status, 404);
    assert.equal((await pedido(`/tecnologias/${id}`, { method: 'DELETE', auth: true })).status, 204);
    assert.equal((await pedido(`/tecnologias/${id}`, { method: 'DELETE', auth: true })).status, 404);
  });
  await t.test('contato mantém o contrato do formulário Angular', async () => {
    assert.equal((await pedido('/contato', { method: 'POST', body: { nome: 'Teste', email: 'invalido', mensagem: 'Mensagem de integração' } })).status, 400);
    const res = await pedido('/contato', { method: 'POST', body: { nome: 'Teste', email: 'teste@example.test', mensagem: 'Mensagem de integração' } });
    assert.equal(res.status, 201); assert.equal(res.body.sucesso, true); idsContatos.push(res.body.id);
  });
  await t.test('OPTIONS permite Authorization; JSON malformado e rota desconhecida são JSON', async () => {
    const res = await pedido('/projetos/1', { method: 'OPTIONS', headers: { Origin: 'http://localhost:4200', 'Access-Control-Request-Method': 'DELETE', 'Access-Control-Request-Headers': 'authorization,content-type' } });
    assert.equal(res.status, 204); assert.match(res.headers.get('access-control-allow-headers'), /authorization/i);
    const malformado = await fetch(base + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformado.status, 400); assert.ok((await malformado.json()).erro);
    assert.equal((await pedido('/inexistente')).status, 404);
  });
});
