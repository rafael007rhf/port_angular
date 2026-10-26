# Portfólio de Rafael Freire

Projeto de Desenvolvimento Web II — IFPR CRPG. A API atual usa Node.js, Express e MariaDB; o Angular consome essa API e permite fazer login para gerenciar projetos. A pasta `portfolio-react/` inicia a nova interface da Aula 25, com dados locais e componentes reutilizáveis.

## Como rodar do zero — Aulas 21 a 24

Requisitos: Node.js **22.12 ou superior** (testado em 24.22.1), npm e MariaDB. Execute os primeiros comandos na raiz do repositório:

```bash
sudo service mariadb start
sudo mariadb < sql/setup.sql
sudo mariadb < sql/usuarios.sql
cd api-node
npm ci
```

`setup.sql` cria o banco `dwii_db`, as tabelas, cinco projetos publicados, um rascunho e seis tecnologias. **Use-o apenas em um banco novo**: não é uma migração para um banco já preenchido. Se o banco das aulas anteriores já existe, execute apenas `usuarios.sql`, que cria a tabela de login sem apagar dados.

Crie o `.env` local a partir do exemplo, gerando um segredo aleatório sem imprimi-lo:

```bash
node -e "const fs=require('node:fs');const c=require('node:crypto');fs.writeFileSync('.env',fs.readFileSync('.env.example','utf8').replace('JWT_SECRET=','JWT_SECRET='+c.randomBytes(48).toString('hex')))"
```

Confira `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` em `.env`. Os padrões correspondem ao banco didático de `setup.sql`. O `.env` é ignorado pelo Git; o servidor recusa iniciar sem um segredo de pelo menos 32 caracteres.

Crie a conta do dono com email próprio e **uma senha escolhida localmente**, sem registrá-la no histórico do terminal. No Bash:

```bash
read -rsp 'Escolha a senha do dono (mínimo de 8 caracteres): ' USUARIO_SENHA
printf '\n'
export USUARIO_SENHA
npm run criar-usuario -- rafa.henrique.freire@gmail.com
unset USUARIO_SENHA
npm start
```

O script grava `bcrypt.hash(senha, 10)` na coluna `senha_hash`, nunca a senha. Ele não sobrescreve usuários existentes. A API atende em **http://localhost:3000**. O email acima é o do autor nos commits; pode ser substituído por outro email próprio ao criar a conta. Nenhuma senha real é fornecida ou versionada.

Em outro terminal, na raiz do repositório:

```bash
cd port_angular
npm ci
npm start
```

O Angular abre em **http://localhost:4200**. Projetos, Catálogo e Contato são públicos. Em `/gestao`, entre com a conta criada: a tela envia `Authorization: Bearer ...`, lista rascunhos, cria, edita e exclui. O token fica em `sessionStorage`; sair o remove, e um 401 devolve a tela ao login. O formulário de contato também usa o Node, preservando o contrato anterior.

### No Codespaces

Encaminhe a porta **3000 como Public** e substitua a origem em `port_angular/src/app/api.config.ts` pela URL HTTPS encaminhada, mantendo `/api` no final. Encaminhe também 4200 para o Angular ou 5173 para o React. Os arquivos PHP ficam como histórico das aulas anteriores; não é necessário iniciar o servidor PHP para a versão atual.

## Aula 21 — O servidor como programa

`api-node/server.js` define o Express e inicia a porta 3000 com `app.listen`. `cors()` permite que o navegador leia a API a partir de outra origem. O GET de projetos mantém o contrato de seis campos: `id`, `nome`, `descricao`, `tecnologias`, `link_github` e `ano`. A troca de linguagem do servidor não exige trocar os componentes que consomem esse contrato.

## Aula 22 — Pool, Promise e await

`api-node/db.js` cria o pool de conexões com `mysql2/promise`. As rotas aguardam `pool.execute(...)`; SELECT devolve linhas e as escritas devolvem `insertId` ou `affectedRows`. As consultas com valores usam `?`, incluindo filtros de status. `try/catch` transforma falhas do banco em 500 JSON sem expor consulta, senha ou detalhes internos.

GET `/api/projetos` e `/api/projetos/:id` só mostram publicados. O GET de um rascunho ou de um id inexistente responde 404. GET `/api/tecnologias` só mostra tecnologias ativas.

## Aula 23 — Criar, alterar e apagar

`express.json()` vem antes das rotas e lê o corpo JSON. POST cria com **201** e id; PUT altera com **200**; DELETE responde **204** sem corpo. Um id inexistente responde **404**, inclusive no segundo DELETE. O nome ausente responde **400**. O catálogo tem as mesmas três escritas, exigindo também a categoria. O middleware `cors()` responde ao OPTIONS e permite o cabeçalho Authorization.

O status do projeto pode ser `rascunho`, `publicado` ou `arquivado`; quando omitido em POST/PUT, o padrão é `publicado`, como no manual. PUT recebe a representação completa. Tipos, tamanhos, ano, status e links são validados no servidor. A tela de gestão continua bloqueando envios repetidos durante uma escrita.

## Aula 24 — Login e tranca da API

- `sql/usuarios.sql`: tabela com email único e `senha_hash`.
- `api-node/criar-usuario.js`: cria a conta com bcrypt e SQL parametrizado.
- `POST /api/login`: valida o corpo, consulta o usuário, usa `bcrypt.compare` e devolve um JWT assinado com HS256.
- `autenticar`, em `api-node/server.js`: um único middleware com `jwt.verify` e `next()`. Ele protege as três escritas de projetos, as três de tecnologias e a leitura de todos os projetos.
- `GET /api/projetos/todos`: inclui rascunhos e status, exige token e está declarado **antes de `/:id`**.

### Escolhas de autenticação

A validade escolhida é **30 minutos**, menor que as 2 horas do exemplo, para reduzir o período em que um token exposto poderia permitir alterações. Ao expirar, o dono precisa entrar novamente. As mensagens de 401 orientam entrar na gestão ou renovar o login.

Senha errada e email inexistente recebem a mesma resposta, “Não foi possível entrar com essas credenciais.”, para não confirmar quais emails estão cadastrados. Isso iguala status e texto; não constitui uma defesa completa contra análise de tempo ou tentativas automatizadas.

### Por que o SEGREDO não deve ficar no código

Um `SEGREDO` fixo no `server.js` público permite que terceiros fabriquem tokens válidos.
A Aula 29 trata essa configuração fora do código, por variáveis de ambiente.
Esta implementação já lê `JWT_SECRET` do ambiente ou do `.env` local ignorado pelo Git.
Em produção, o valor deve ser forte, privado e configurado no ambiente de execução.

### Rotas × verbos × token

| Rota | Verbo | Precisa de token? | Resposta principal |
| --- | --- | --- | --- |
| `/api/login` | POST | Não | 200 + token; 400; 401 |
| `/api/projetos` | GET | Não | 200 + array de publicados |
| `/api/projetos/todos` | GET | Sim | 200 + array incluindo rascunhos; 401 |
| `/api/projetos/:id` | GET | Não | 200 + objeto publicado; 404 |
| `/api/projetos` | POST | Sim | 201 + id; 400; 401 |
| `/api/projetos/:id` | PUT | Sim | 200 + mensagem; 400; 401; 404 |
| `/api/projetos/:id` | DELETE | Sim | 204 sem corpo; 401; 404 |
| `/api/tecnologias` | GET | Não | 200 + array de ativas |
| `/api/tecnologias` | POST | Sim | 201 + id; 400; 401 |
| `/api/tecnologias/:id` | PUT | Sim | 200 + mensagem; 400; 401; 404 |
| `/api/tecnologias/:id` | DELETE | Sim | 204 sem corpo; 401; 404 |
| `/api/contato` | POST | Não | 201 + sucesso/id/mensagem; 400 + erros |
| Rotas da API | OPTIONS | Não | 204 + cabeçalhos CORS |

Falhas do banco respondem 500 em JSON. Rota desconhecida responde 404 JSON. O frontend usa `api.config.ts` para a origem da API; os componentes delegam HTTP aos services.

### O que esta API ainda não faz

1. Não limita tentativas de login nem oferece recuperação de senha, segundo fator ou bloqueio por abuso. O formulário de contato também não tem proteção antispam.
2. Não revoga JWT antes dos 30 minutos: sair apaga o token do navegador, mas uma cópia continua válida até expirar. Não há múltiplos papéis ou isolamento de dados por usuário: contas criadas pelo script têm a mesma gestão.

### Curls e respostas obtidas

Execução em **26/10/2026**, em MariaDB 10.11, com os dados de `setup.sql` e uma conta descartável criada pelo script com o email do autor. Os exemplos abaixo registram requisições realmente executadas; ids dependem da sequência local. A senha foi substituída por `<senha>` e o token por `<token>`. A conta de teste não configura senha de produção para quem clonar o projeto.

Antes de reproduzir, na raiz:

```bash
API=http://localhost:3000/api
```

Depois do login correto, copie o token recebido para uma variável local, sem incluí-lo em um commit:

```bash
read -rp 'Cole o token recebido: ' TOKEN
```

Use o id retornado pelo seu POST nos comandos PUT/DELETE; os números abaixo são os da execução registrada.

#### GET público sem token

```bash
curl -i "$API/projetos"
```

```text
HTTP/1.1 200 OK
[{"id":1,"nome":"Portfolio Pessoal","descricao":"Site de portfolio responsivo com PHP, PDO e MariaDB, painel admin e login.","tecnologias":"PHP, MariaDB, CSS, Git","link_github":"https://github.com/usuario/portfolio","ano":2026},{"id":5,"nome":"API de Clima","descricao":"Microsservico que consome uma API publica e devolve a previsao em JSON.","tecnologias":"PHP, REST","link_github":"https://github.com/usuario/clima","ano":2026},{"id":2,"nome":"Sistema de Biblioteca","descricao":"CRUD de acervo e emprestimos, com busca e relatorios.","tecnologias":"PHP, MariaDB, Bootstrap","link_github":"https://github.com/usuario/biblioteca","ano":2025},{"id":3,"nome":"App de Tarefas","descricao":"Lista de tarefas com categorias, prazos e filtro por status.","tecnologias":"JavaScript, HTML, CSS","link_github":"https://github.com/usuario/tarefas","ano":2025},{"id":4,"nome":"Loja Virtual (prototipo)","descricao":"Catalogo de produtos com carrinho e checkout simulado.","tecnologias":"PHP, MariaDB, JavaScript","link_github":"https://github.com/usuario/loja","ano":2024}]
```

#### Um projeto publicado

```bash
curl -i "$API/projetos/1"
```

```text
HTTP/1.1 200 OK
{"id":1,"nome":"Portfolio Pessoal","descricao":"Site de portfolio responsivo com PHP, PDO e MariaDB, painel admin e login.","tecnologias":"PHP, MariaDB, CSS, Git","link_github":"https://github.com/usuario/portfolio","ano":2026}
```

#### Projeto inexistente

```bash
curl -i "$API/projetos/99999999"
```

```text
HTTP/1.1 404 Not Found
{"erro":"Projeto nao encontrado"}
```

#### Login correto

```bash
curl -i -X POST "$API/login" -H 'Content-Type: application/json' -d '{"email":"rafa.henrique.freire@gmail.com","senha":"<senha>"}'
```

```text
HTTP/1.1 200 OK
{"token":"<token>"}
```

#### Login incorreto

```bash
curl -i -X POST "$API/login" -H 'Content-Type: application/json' -d '{"email":"rafa.henrique.freire@gmail.com","senha":"incorreta"}'
```

```text
HTTP/1.1 401 Unauthorized
{"erro":"Não foi possível entrar com essas credenciais."}
```

#### Login sem senha

```bash
curl -i -X POST "$API/login" -H 'Content-Type: application/json' -d '{"email":"rafa.henrique.freire@gmail.com"}'
```

```text
HTTP/1.1 400 Bad Request
{"erro":"Informe email e senha"}
```

#### POST sem token

```bash
curl -i -X POST "$API/projetos" -H 'Content-Type: application/json' -d '{"nome":"Projeto curl","ano":2026}'
```

```text
HTTP/1.1 401 Unauthorized
{"erro":"Entre na gestão e envie o token Bearer para continuar."}
```

#### POST com token

```bash
curl -i -X POST "$API/projetos" -H 'Content-Type: application/json' -d '{"nome":"Projeto curl","ano":2026}' -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 201 Created
{"id":8}
```

#### POST inválido com token

```bash
curl -i -X POST "$API/projetos" -H 'Content-Type: application/json' -d '{}' -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 400 Bad Request
{"erro":"Informe pelo menos o nome do projeto"}
```

#### PUT com token

```bash
curl -i -X PUT "$API/projetos/8" -H 'Content-Type: application/json' -d '{"nome":"Projeto curl alterado","ano":2026,"status":"rascunho"}' -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 200 OK
{"mensagem":"Projeto atualizado"}
```

#### PUT inexistente com token

```bash
curl -i -X PUT "$API/projetos/99999999" -H 'Content-Type: application/json' -d '{"nome":"Projeto curl","ano":2026}' -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 404 Not Found
{"erro":"Projeto nao encontrado"}
```

#### Todos sem token

```bash
curl -i "$API/projetos/todos"
```

```text
HTTP/1.1 401 Unauthorized
{"erro":"Entre na gestão e envie o token Bearer para continuar."}
```

#### Todos com token, incluindo rascunhos

```bash
curl -i "$API/projetos/todos" -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 200 OK
[{"id":1,"nome":"Portfolio Pessoal","descricao":"Site de portfolio responsivo com PHP, PDO e MariaDB, painel admin e login.","tecnologias":"PHP, MariaDB, CSS, Git","link_github":"https://github.com/usuario/portfolio","ano":2026,"status":"publicado"},{"id":5,"nome":"API de Clima","descricao":"Microsservico que consome uma API publica e devolve a previsao em JSON.","tecnologias":"PHP, REST","link_github":"https://github.com/usuario/clima","ano":2026,"status":"publicado"},{"id":6,"nome":"Jogo da Velha (em construcao)","descricao":"Jogo da velha local - ainda em desenvolvimento.","tecnologias":"JavaScript, HTML","link_github":null,"ano":2026,"status":"rascunho"},{"id":8,"nome":"Projeto curl alterado","descricao":"","tecnologias":"","link_github":"","ano":2026,"status":"rascunho"},{"id":2,"nome":"Sistema de Biblioteca","descricao":"CRUD de acervo e emprestimos, com busca e relatorios.","tecnologias":"PHP, MariaDB, Bootstrap","link_github":"https://github.com/usuario/biblioteca","ano":2025,"status":"publicado"},{"id":3,"nome":"App de Tarefas","descricao":"Lista de tarefas com categorias, prazos e filtro por status.","tecnologias":"JavaScript, HTML, CSS","link_github":"https://github.com/usuario/tarefas","ano":2025,"status":"publicado"},{"id":4,"nome":"Loja Virtual (prototipo)","descricao":"Catalogo de produtos com carrinho e checkout simulado.","tecnologias":"PHP, MariaDB, JavaScript","link_github":"https://github.com/usuario/loja","ano":2024,"status":"publicado"}]
```

#### DELETE sem token

```bash
curl -i -X DELETE "$API/projetos/8"
```

```text
HTTP/1.1 401 Unauthorized
{"erro":"Entre na gestão e envie o token Bearer para continuar."}
```

#### DELETE com token

```bash
curl -i -X DELETE "$API/projetos/8" -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 204 No Content
(sem corpo)
```

#### DELETE repetido

```bash
curl -i -X DELETE "$API/projetos/8" -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 404 Not Found
{"erro":"Projeto nao encontrado"}
```

#### Catálogo público

```bash
curl -i "$API/tecnologias"
```

```text
HTTP/1.1 200 OK
[{"id":4,"nome":"PHP","categoria":"Backend","descricao":"Linguagem server-side para web dinamica.","ano_criacao":1994},{"id":5,"nome":"MariaDB","categoria":"Banco de Dados","descricao":"SGBD relacional open-source.","ano_criacao":2009},{"id":6,"nome":"Git","categoria":"DevOps","descricao":"Sistema de controle de versao distribuido.","ano_criacao":2005},{"id":2,"nome":"CSS","categoria":"Frontend","descricao":"Linguagem de estilos para apresentacao visual.","ano_criacao":1996},{"id":1,"nome":"HTML","categoria":"Frontend","descricao":"Linguagem de marcacao para estrutura de paginas.","ano_criacao":1993},{"id":3,"nome":"JavaScript","categoria":"Frontend","descricao":"Linguagem de programacao para o navegador.","ano_criacao":1995}]
```

#### Tecnologia: POST com token

```bash
curl -i -X POST "$API/tecnologias" -H 'Content-Type: application/json' -d '{"nome":"Node.js","categoria":"Backend","ano_criacao":2009}' -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 201 Created
{"id":8}
```

#### Tecnologia: PUT com token

```bash
curl -i -X PUT "$API/tecnologias/8" -H 'Content-Type: application/json' -d '{"nome":"Node.js","categoria":"Runtime","ano_criacao":2009}' -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 200 OK
{"mensagem":"Tecnologia atualizada"}
```

#### Tecnologia: DELETE com token

```bash
curl -i -X DELETE "$API/tecnologias/8" -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 204 No Content
(sem corpo)
```

#### Pré-voo OPTIONS

```bash
curl -i -X OPTIONS "$API/projetos/1" -H 'Origin: http://localhost:4200' -H 'Access-Control-Request-Method: DELETE' -H 'Access-Control-Request-Headers: authorization,content-type'
```

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: authorization,content-type
(sem corpo)
```

#### Token continua válido após reiniciar o servidor HTTP

```bash
curl -i "$API/projetos/todos" -H "Authorization: Bearer $TOKEN"
```

```text
HTTP/1.1 200 OK
[{"id":1,"nome":"Portfolio Pessoal","descricao":"Site de portfolio responsivo com PHP, PDO e MariaDB, painel admin e login.","tecnologias":"PHP, MariaDB, CSS, Git","link_github":"https://github.com/usuario/portfolio","ano":2026,"status":"publicado"},{"id":5,"nome":"API de Clima","descricao":"Microsservico que consome uma API publica e devolve a previsao em JSON.","tecnologias":"PHP, REST","link_github":"https://github.com/usuario/clima","ano":2026,"status":"publicado"},{"id":6,"nome":"Jogo da Velha (em construcao)","descricao":"Jogo da velha local - ainda em desenvolvimento.","tecnologias":"JavaScript, HTML","link_github":null,"ano":2026,"status":"rascunho"},{"id":2,"nome":"Sistema de Biblioteca","descricao":"CRUD de acervo e emprestimos, com busca e relatorios.","tecnologias":"PHP, MariaDB, Bootstrap","link_github":"https://github.com/usuario/biblioteca","ano":2025,"status":"publicado"},{"id":3,"nome":"App de Tarefas","descricao":"Lista de tarefas com categorias, prazos e filtro por status.","tecnologias":"JavaScript, HTML, CSS","link_github":"https://github.com/usuario/tarefas","ano":2025,"status":"publicado"},{"id":4,"nome":"Loja Virtual (prototipo)","descricao":"Catalogo de produtos com carrinho e checkout simulado.","tecnologias":"PHP, MariaDB, JavaScript","link_github":"https://github.com/usuario/loja","ano":2024,"status":"publicado"}]
```

#### Banco indisponível: 500 em JSON

```bash
curl -i "$API/projetos"
```

```text
HTTP/1.1 500 Internal Server Error
{"erro":"Não foi possível consultar os projetos."}
```

### Verificação da API

Com o banco e a tabela de usuários preparados e o `.env` configurado, execute `npm test` em `api-node/`. O teste usa MariaDB real, cria registros temporários identificados e os remove no fim. Ele não usa mocks do banco; execute preferencialmente em um banco local de desenvolvimento.

Resultado: **8 testes aprovados** (um teste principal e sete cenários): leituras públicas, tranca das seis escritas, login/token/hash, CRUD de projetos, CRUD de tecnologias, contato e CORS/JSON inválido. Os curls também comprovaram token válido após reiniciar o servidor HTTP e resposta 500 JSON com o banco desligado.

### Autoavaliação — Entrega A

**Conceito pretendido: A**, com as seguintes evidências no código:

| Critério | Onde conferir |
| --- | --- |
| Leituras, CRUD, validação e consultas com parâmetros | `api-node/server.js`, rotas de projetos e tecnologias |
| Hash e criação do dono | `sql/usuarios.sql` e `api-node/criar-usuario.js` |
| Login e uma única implementação de autenticar | `api-node/server.js`, antes das rotas de projetos |
| Rascunhos protegidos antes de /:id | `GET /api/projetos/todos` em `api-node/server.js` |
| Validade, escolhas, limites, tabela e curls | Seções da Aula 24 neste README |
| Quatro etapas de implementação | Commits `Aula 21:`, `Aula 22:`, `Aula 23:` e `Aula 24:` |

Os novos commits seguem o formato `Aula NN: ...`. O histórico anterior foi preservado e contém mensagens fora desse padrão; não foi reescrito para simular um histórico diferente. A avaliação final cabe ao professor.


## Registro histórico — Aulas 16 a 19

As seções abaixo registram a implementação PHP anterior. Seus comandos e referências descrevem aquele estágio; para executar o projeto atual, use as instruções Node no início deste README.

## Aula 17 / Atividade 13

Projetos e Catálogo usam services injetáveis e recebem os dados reais da API. Nenhum componente conhece ou usa diretamente a URL dos endpoints.

### 🎯 Autoavaliação — Atividade 13

**Conceito pretendido: A.**

- O `HttpClient` está habilitado em `port_angular/src/app/app.config.ts:2-11`.
- `port_angular/src/app/projeto.service.ts:23-33` concentra a URL e o GET público; `port_angular/src/app/projetos/projetos.ts:12-30` usa `OnInit`, `inject` e `subscribe` com `next/error`.
- `port_angular/src/app/projetos/projetos.html:3-34` tem carregamento, erro, vazio, `@for`, cards e o botão **Ver no GitHub** com `[href]`, `target` e `rel`.
- `port_angular/src/app/tecnologia.service.ts:13-20`, `port_angular/src/app/catalogo/catalogo.ts:11-29` e `port_angular/src/app/catalogo/catalogo.html:3-30` repetem o mesmo padrão no Catálogo.
- O extra do conceito A é o estado vazio nas duas telas: “Nenhum projeto publicado ainda.” e “Nenhuma tecnologia cadastrada ainda.”

## Aula 18 / Atividade 14

O formulário envia JSON ao PHP. A validação do Angular melhora o uso da tela, mas a API valida tudo novamente antes de inserir no banco.

### Testes do contato com curl

Com PHP e MariaDB em execução, estes comandos comprovam 201 para um contato válido e 400 para um e-mail inválido:

```bash
curl -i -X POST http://localhost:8000/api/contato.php \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Rafael","email":"rafael@example.com","mensagem":"Mensagem valida para teste"}'

curl -i -X POST http://localhost:8000/api/contato.php \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Rafael","email":"email-invalido","mensagem":"Mensagem valida para teste"}'
```

Esses curls não foram executados nesta implementação porque o ambiente não possui PHP nem MariaDB.

### 🎯 Autoavaliação — Atividade 14

**Conceito pretendido: A.**

- `sql/setup.sql:32-38` contém a tabela `contatos` pedida.
- `api/contato.php:21-46` lê `php://input`, usa `trim`, valida os campos e responde 400 com `erros`; `api/contato.php:49-60` grava com `prepare/execute` e responde 201.
- `port_angular/src/app/contato.service.ts:17-24` tipa a resposta e executa o `http.post` fora do componente.
- `port_angular/src/app/contato/contato.ts:19-56` configura os `Validators`, impede POST inválido e trata sucesso, `reset()`, erro de rede e erros 400 com `HttpErrorResponse`.
- `port_angular/src/app/contato/contato.html:29-82` liga os labels por `for/id`, usa `touched`, mostra cada erro em texto e desabilita o botão quando o formulário está inválido ou enviando.
- `port_angular/src/app/contato/contato.ts:59-63` foca o primeiro campo inválido; o CSS também mantém foco e campo inválido visíveis.

## Aula 19 / Atividade 15

### Um endereço, quatro ações

O arquivo `api/projetos.php` consegue listar, criar, alterar e apagar no mesmo endereço porque o servidor verifica o método, ou verbo, da requisição. Depois dessa verificação, ele executa o trecho correspondente a GET, POST, PUT ou DELETE.

### Testes com curl

Os comandos abaixo ficam como roteiro reproduzível. Troque `ID` pelo número criado no POST.

```bash
API=http://localhost:8000/api/projetos.php

curl -i "$API"
curl -i -X OPTIONS "$API"

curl -i -X POST "$API" \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Projeto curl","descricao":"Teste","tecnologias":"Angular, PHP","link_github":"","ano":2026,"status":"rascunho"}'

curl -i -X POST "$API" \
  -H 'Content-Type: application/json' \
  -d '{}'

curl -i -X PUT "$API?id=ID" \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Projeto alterado","descricao":"Teste","tecnologias":"Angular, PHP","link_github":"","ano":2026,"status":"publicado"}'

curl -i -X DELETE "$API?id=ID"
curl -i -X DELETE "$API?id=ID"
curl -i -X PATCH "$API"
```

Resultados definidos pelo endpoint:

| Caso | Primeira linha / conteúdo esperado |
| --- | --- |
| GET | `HTTP/1.1 200 OK` + lista JSON |
| POST válido | `HTTP/1.1 201 Created` + `{"id":N}` |
| POST sem nome | `HTTP/1.1 400 Bad Request` + `{"erro":"Informe pelo menos o nome do projeto"}` |
| PUT válido | `HTTP/1.1 200 OK` + `{"mensagem":"Projeto atualizado"}` |
| DELETE existente | `HTTP/1.1 204 No Content`, sem corpo |
| DELETE repetido | `HTTP/1.1 404 Not Found` + `{"erro":"Projeto nao encontrado"}` |
| PATCH | `HTTP/1.1 405 Method Not Allowed` + `{"erro":"Metodo nao permitido"}` |
| OPTIONS | `HTTP/1.1 204 No Content` e `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS` |

O contrato de escrita testável é: **POST** em `/api/projetos.php`, resposta **201 Created** e `Content-Type: application/json; charset=utf-8`. Criar retorna 201 porque um recurso novo foi criado; apagar retorna 204 porque a exclusão terminou e não há conteúdo para devolver.

PHP e MariaDB não estavam instalados neste ambiente. Por isso, a tabela acima descreve as respostas implementadas no código, mas não é apresentada como uma execução real dos curls.

### O que a aba Network deve mostrar

Com a API ligada, adicionar deve mostrar POST/201, salvar uma edição PUT/200 e excluir DELETE/204. A aba Network não pôde ser observada aqui porque não havia backend PHP nem navegador conectado; o build, os testes de componentes e as rotas do servidor Angular foram verificados separadamente.

### Clique duplo e estado salvando

1. Dois cliques rápidos podem mandar dois POSTs e criar dois registros iguais.
2. Isso acontece porque cada POST pede a criação de um novo recurso e não é automaticamente idempotente.
3. O estado `salvando` bloqueia o botão até a resposta chegar e evita o segundo envio.

### Estratégias de atualização

Depois de adicionar ou editar, a tela chama `carregar()` e busca a lista novamente. Essa estratégia faz uma ida extra à rede, mas recebe o estado atual do banco. Depois de excluir, a tela usa `filter` no array local; isso economiza uma requisição e remove a linha imediatamente.

A atualização somente local pode ficar desatualizada se outra aba, outro usuário ou um UPDATE externo mudar o banco. Buscar novamente custa mais uma requisição, mas reduz essa diferença.

### Preflight

Antes de um DELETE entre origens diferentes, o navegador pode enviar OPTIONS para perguntar ao servidor se aquele método e aqueles headers são permitidos. `api/projetos.php:3-12` responde 204 e anuncia todos os métodos necessários.

### Objeção sobre DELETE via GET

Um link GET não deve apagar porque GET é usado para leitura e pode ser aberto, pré-carregado ou repetido sem intenção de excluir. O botão chama DELETE e ainda pede confirmação com o nome. A evidência é `curl -i -X DELETE "$API?id=ID"`: o verbo deixa explícita a operação e a API devolve 204.

### Polimento pesquisado

O único polimento pesquisado foi o estado próprio de lista vazia: “Você ainda não cadastrou nenhum projeto.”, em `port_angular/src/app/gestao/gestao.html:88-90`. A referência foi a orientação oficial do [Material Design sobre empty states](https://m1.material.io/patterns/empty-states.html), que recomenda não deixar uma lista vazia sem explicação.

### Diagnóstico técnico desta implementação

- **Problema encontrado:** `api/tecnologias.php` selecionava colunas que pertenciam a projetos, por isso o Catálogo não receberia a interface esperada.
- **Correção feita:** a consulta agora retorna `id`, `nome`, `categoria`, `descricao` e `ano_criacao`. Também foram corrigidos o teste antigo do título e o fechamento do HTML da Home.
- **Algo mantido sem alteração:** a rota `/gestao` continua sem login, guard ou JWT porque a proteção dessa área pertence ao conteúdo posterior, conforme o enunciado.

### 🎯 Autoavaliação — Atividade 15

**Conceito pretendido: A.**

- **R1 — API CRUD:** `api/projetos.php:3-18` trata CORS, OPTIONS e 405; `api/projetos.php:21-35` lista; `api/projetos.php:38-74` cria; `api/projetos.php:77-133` atualiza; `api/projetos.php:136-155` exclui. Toda escrita usa `prepare/execute` e os retornos incluem 201, 200, 204, 400 e 404.
- **R2 — Service e gestão:** `port_angular/src/app/projeto.service.ts:23-46` concentra GET/POST/PUT/DELETE. `port_angular/src/app/gestao/gestao.ts:41-91` carrega e salva sem HTTP direto no componente; `port_angular/src/app/gestao/gestao.ts:94-146` edita, confirma e exclui.
- **R3 — Regras da tela:** `port_angular/src/app/gestao/gestao.ts:20-27` valida Nome, Ano e Status; `port_angular/src/app/gestao/gestao.ts:80-90` limpa, volta ao modo adicionar e recarrega; `port_angular/src/app/gestao/gestao.ts:123-145` confirma pelo nome e remove com `filter`.
- **R4 — Status e erros:** o GET normal filtra publicados e `?todos=1` lista a gestão em `api/projetos.php:24-31`; o formulário escolhe rascunho/publicado e a lista mostra o status em texto em `port_angular/src/app/gestao/gestao.html:48-52` e `port_angular/src/app/gestao/gestao.html:92-110`. Falhas aparecem em português na tela.
- **R5 — acabamento:** a meta viewport está em `port_angular/src/index.html:7`; a navegação responsiva está em `port_angular/src/app/app.css:1-44`; foco visível, lista contida e quebra de texto estão em `port_angular/src/app/gestao/gestao.css:28-63`; carregamento e lista vazia estão em `port_angular/src/app/gestao/gestao.html:84-90`.


## Autor e uso de IA

Rafael Henrique Freire — Técnico em Informática, IFPR CRPG.

Uso de IA: ChatGPT auxiliou na implementação, documentação e testes das Aulas 21 a 24 a partir dos enunciados fornecidos.
