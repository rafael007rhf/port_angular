const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORTA = Number(process.env.PORT || 3000);
app.use(cors());

const camposProjeto = 'id, nome, descricao, tecnologias, link_github, ano';

app.get('/api/projetos', async (req, res) => {
  try {
    const [projetos] = await pool.execute(`SELECT ${camposProjeto} FROM projetos WHERE status = ? ORDER BY ano DESC, id`, ['publicado']);
    res.json(projetos);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível consultar os projetos.' });
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

if (require.main === module) {
  app.listen(PORTA, () => console.log(`API no ar em http://localhost:${PORTA}`));
}
module.exports = app;
