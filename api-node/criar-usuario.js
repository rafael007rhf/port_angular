const bcrypt = require('bcryptjs');
const pool = require('./db');

async function criar() {
  const email = (process.argv[2] || process.env.USUARIO_EMAIL || '').trim().toLowerCase();
  const senha = process.env.USUARIO_SENHA || process.argv[3];
  try {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120 || !senha || senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
      console.error('Informe email válido e senha de 8 caracteres ou mais (máximo de 72 bytes).');
      console.error('Uso: USUARIO_SENHA definida no ambiente + npm run criar-usuario -- seu@email.com');
      process.exitCode = 1;
      return;
    }
    const hash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.execute('INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)', [email, hash]);
    console.log(`Usuario ${resultado.insertId} criado: ${email}`);
  } catch (erro) {
    console.error(erro.code === 'ER_DUP_ENTRY' ? 'Este email já possui um usuário. Nenhuma senha foi alterada.' : 'Não foi possível criar o usuário. Confira a conexão com o banco.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
criar();
