const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SEGREDO = process.env.JWT_SECRET;
if (!SEGREDO || SEGREDO.length < 32) throw new Error('Defina JWT_SECRET com pelo menos 32 caracteres no ambiente ou em api-node/.env');
const VALIDADE_TOKEN = '30m';

const app = express();
const PORTA = Number(process.env.PORT || 3000);
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Um só middleware protege projetos e catálogo, sem copiar verify nas rotas.
function autenticar(req, res, next) {
  const cabecalho = req.get('Authorization') || '';
  const partes = /^Bearer ([^\s]+)$/i.exec(cabecalho);
  if (!partes) return res.status(401).json({ erro: 'Entre na gestão e envie o token Bearer para continuar.' });
  try {
    req.usuario = jwt.verify(partes[1], SEGREDO, { algorithms: ['HS256'] });
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Seu token expirou ou não é válido. Faça login novamente.' });
  }
}

app.post('/api/login', async (req, res) => {
  const dados = req.body;
  if (!dados || typeof dados.email !== 'string' || !dados.email.trim() || typeof dados.senha !== 'string' || !dados.senha) {
    return res.status(400).json({ erro: 'Informe email e senha' });
  }
  if (dados.email.length > 120 || Buffer.byteLength(dados.senha, 'utf8') > 72) return res.status(401).json({ erro: 'Não foi possível entrar com essas credenciais.' });
  try {
    const [linhas] = await pool.execute('SELECT id, email, senha_hash FROM usuarios WHERE email = ?', [dados.email.trim().toLowerCase()]);
    const usuario = linhas[0];
    if (!usuario || !(await bcrypt.compare(dados.senha, usuario.senha_hash))) {
      return res.status(401).json({ erro: 'Não foi possível entrar com essas credenciais.' });
    }
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, SEGREDO, { algorithm: 'HS256', expiresIn: VALIDADE_TOKEN });
    res.json({ token });
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível verificar o login.' });
  }
});

const camposProjeto = 'id, nome, descricao, tecnologias, link_github, ano';

app.get('/api/projetos', async (req, res) => {
  try {
    const [projetos] = await pool.execute(`SELECT ${camposProjeto} FROM projetos WHERE status = ? ORDER BY ano DESC, id`, ['publicado']);
    res.json(projetos);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível consultar os projetos.' });
  }
});

// A rota fixa vem antes de /:id: 'todos' não é um identificador de projeto.
app.get('/api/projetos/todos', autenticar, async (req, res) => {
  try {
    const [projetos] = await pool.execute(`SELECT ${camposProjeto}, status FROM projetos ORDER BY ano DESC, id`);
    res.json(projetos);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível consultar a gestão.' });
  }
});

app.get('/api/projetos/:id', async (req, res) => {
  try {
    const [linhas] = await pool.execute(`SELECT ${camposProjeto} FROM projetos WHERE id = ? AND status = ?`, [req.params.id, 'publicado']);
    if (linhas.length === 0) return res.status(404).json({ erro: 'Projeto nao encontrado' });
    res.json(linhas[0]);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível consultar o projeto.' });
  }
});

app.get('/api/tecnologias', async (req, res) => {
  try {
    const [tecnologias] = await pool.execute('SELECT id, nome, categoria, descricao, ano_criacao FROM tecnologias WHERE status = ? ORDER BY categoria, nome', ['ativo']);
    res.json(tecnologias);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível consultar o catálogo.' });
  }
});

// O nome é obrigatório; tipos e limites também são verificados no servidor.
function validarProjeto(dados) {
  if (!dados || typeof dados.nome !== 'string' || !dados.nome.trim()) return 'Informe pelo menos o nome do projeto';
  if (dados.nome.trim().length > 120) return 'O nome deve ter até 120 caracteres';
  for (const campo of ['descricao', 'tecnologias', 'link_github']) {
    if (dados[campo] != null && typeof dados[campo] !== 'string') return 'Os textos do projeto devem ser strings';
  }
  if ((dados.tecnologias?.length || 0) > 200 || (dados.link_github?.length || 0) > 300) return 'Tecnologias ou link ultrapassam o limite';
  if (dados.link_github && !/^https?:\/\//i.test(dados.link_github)) return 'O link deve começar com http:// ou https://';
  if (dados.ano != null && (!Number.isInteger(dados.ano) || dados.ano < 1901 || dados.ano > 2155)) return 'Informe um ano entre 1901 e 2155';
  if (dados.status != null && !['rascunho', 'publicado', 'arquivado'].includes(dados.status)) return 'Status de projeto inválido';
  return null;
}

function valoresProjeto(dados) {
  return [dados.nome.trim(), dados.descricao ?? '', dados.tecnologias ?? '', dados.link_github ?? '', dados.ano ?? new Date().getFullYear(), dados.status ?? 'publicado'];
}

app.post('/api/projetos', autenticar, async (req, res) => {
  const erro = validarProjeto(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const [resultado] = await pool.execute('INSERT INTO projetos (nome, descricao, tecnologias, link_github, ano, status) VALUES (?, ?, ?, ?, ?, ?)', valoresProjeto(req.body));
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível criar o projeto.' });
  }
});

app.put('/api/projetos/:id', autenticar, async (req, res) => {
  const erro = validarProjeto(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const [resultado] = await pool.execute('UPDATE projetos SET nome = ?, descricao = ?, tecnologias = ?, link_github = ?, ano = ?, status = ? WHERE id = ?', [...valoresProjeto(req.body), req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: 'Projeto nao encontrado' });
    res.json({ mensagem: 'Projeto atualizado' });
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível atualizar o projeto.' });
  }
});

app.delete('/api/projetos/:id', autenticar, async (req, res) => {
  try {
    const [resultado] = await pool.execute('DELETE FROM projetos WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: 'Projeto nao encontrado' });
    res.status(204).end();
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível excluir o projeto.' });
  }
});

function validarTecnologia(dados) {
  if (!dados || typeof dados.nome !== 'string' || !dados.nome.trim()) return 'Informe o nome da tecnologia';
  if (typeof dados.categoria !== 'string' || !dados.categoria.trim()) return 'Informe a categoria da tecnologia';
  if (dados.nome.trim().length > 100 || dados.categoria.trim().length > 50) return 'Nome ou categoria ultrapassam o limite';
  if (dados.descricao != null && typeof dados.descricao !== 'string') return 'A descrição deve ser texto';
  if (dados.ano_criacao != null && (!Number.isInteger(dados.ano_criacao) || dados.ano_criacao < 1 || dados.ano_criacao > 2155)) return 'Ano de criação inválido';
  if (dados.status != null && !['ativo', 'inativo'].includes(dados.status)) return 'Status de tecnologia inválido';
  return null;
}

function valoresTecnologia(dados) {
  return [dados.nome.trim(), dados.categoria.trim(), dados.descricao ?? '', dados.ano_criacao ?? null, dados.status ?? 'ativo'];
}

app.post('/api/tecnologias', autenticar, async (req, res) => {
  const erro = validarTecnologia(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const [resultado] = await pool.execute('INSERT INTO tecnologias (nome, categoria, descricao, ano_criacao, status) VALUES (?, ?, ?, ?, ?)', valoresTecnologia(req.body));
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível criar a tecnologia.' });
  }
});

app.put('/api/tecnologias/:id', autenticar, async (req, res) => {
  const erro = validarTecnologia(req.body);
  if (erro) return res.status(400).json({ erro });
  try {
    const [resultado] = await pool.execute('UPDATE tecnologias SET nome = ?, categoria = ?, descricao = ?, ano_criacao = ?, status = ? WHERE id = ?', [...valoresTecnologia(req.body), req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: 'Tecnologia nao encontrada' });
    res.json({ mensagem: 'Tecnologia atualizada' });
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível atualizar a tecnologia.' });
  }
});

app.delete('/api/tecnologias/:id', autenticar, async (req, res) => {
  try {
    const [resultado] = await pool.execute('DELETE FROM tecnologias WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: 'Tecnologia nao encontrada' });
    res.status(204).end();
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível excluir a tecnologia.' });
  }
});

// Mantém o formulário de contato funcionando sem precisar iniciar a API PHP antiga.
app.post('/api/contato', async (req, res) => {
  const dados = req.body || {};
  const nome = typeof dados.nome === 'string' ? dados.nome.trim() : '';
  const email = typeof dados.email === 'string' ? dados.email.trim() : '';
  const mensagem = typeof dados.mensagem === 'string' ? dados.mensagem.trim() : '';
  const erros = [];
  if (!nome || nome.length > 120) erros.push('Informe um nome de até 120 caracteres.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) erros.push('Informe um e-mail valido.');
  if (mensagem.length < 10 || Buffer.byteLength(mensagem, 'utf8') > 60000) erros.push('A mensagem deve ter no minimo 10 caracteres e até 60 KB.');
  if (erros.length) return res.status(400).json({ erros });
  try {
    const [resultado] = await pool.execute('INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)', [nome, email, mensagem]);
    res.status(201).json({ sucesso: true, id: resultado.insertId, mensagem: 'Contato recebido com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível registrar o contato.' });
  }
});

// JSON malformado e rotas desconhecidas também mantêm o contrato JSON.
app.use((req, res) => res.status(404).json({ erro: 'Rota nao encontrada' }));
app.use((erro, req, res, next) => {
  const status = erro.status === 413 ? 413 : erro.type === 'entity.parse.failed' ? 400 : 500;
  res.status(status).json({ erro: status === 400 ? 'Envie um JSON válido' : status === 413 ? 'Corpo do pedido muito grande' : 'Falha no servidor' });
});

if (require.main === module) {
  app.listen(PORTA, () => console.log(`API no ar em http://localhost:${PORTA}`));
}
module.exports = app;
