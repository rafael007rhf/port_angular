const express = require('express');
const cors = require('cors');

const app = express();
const PORTA = Number(process.env.PORT || 3000);
app.use(cors());

// Aula 21: primeiro contrato, ainda sem banco.
const projetos = [
  { id: 1, nome: 'Portfólio Angular', descricao: 'Portfólio da disciplina de DWII.', tecnologias: 'Angular, TypeScript', link_github: 'https://github.com/rafael007rhf/port_angular', ano: 2026 },
];
app.get('/api/projetos', (req, res) => res.json(projetos));
app.listen(PORTA, () => console.log(`API no ar em http://localhost:${PORTA}`));
