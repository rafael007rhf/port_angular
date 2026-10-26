const mysql = require('mysql2/promise');

// O pool reutiliza conexões; cada consulta continua devolvendo uma Promise.
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'dwii_user',
  password: process.env.DB_PASSWORD || 'dwii2026',
  database: process.env.DB_NAME || 'dwii_db',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
});

module.exports = pool;
