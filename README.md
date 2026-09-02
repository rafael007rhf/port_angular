# Port Angular

Portfólio de Rafael Freire desenvolvido na disciplina de Desenvolvimento Web II. O frontend continua em Angular com Angular Material e o backend continua em PHP com PDO e MariaDB.

## Como executar

O arquivo `sql/setup.sql` prepara o banco `dwii_db`, as tabelas e os dados iniciais. Ele contém comandos de criação, portanto deve ser usado em um banco novo; não execute o arquivo inteiro sobre um banco já preenchido sem antes conferir os dados.

Na raiz do repositório, inicie a API:

```bash
/usr/bin/php -S 0.0.0.0:8000
```

Em outro terminal, inicie o Angular:

```bash
cd port_angular
npm install
npm start
```

O frontend fica em `http://localhost:4200` e a API em `http://localhost:8000`. No Codespaces, a porta 8000 precisa estar como **Public**. Quando o endereço público mudar, atualize somente as propriedades `apiUrl` em:

- `port_angular/src/app/projeto.service.ts:26`;
- `port_angular/src/app/tecnologia.service.ts:16`;
- `port_angular/src/app/contato.service.ts:20`.

## API

| Método | Endereço | Função |
| --- | --- | --- |
| GET | `/api/projetos.php` | Lista somente projetos publicados |
| GET | `/api/projetos.php?todos=1` | Lista projetos para a gestão, inclusive rascunhos |
| POST | `/api/projetos.php` | Cria um projeto |
| PUT | `/api/projetos.php?id=N` | Atualiza um projeto |
| DELETE | `/api/projetos.php?id=N` | Exclui um projeto |
| GET | `/api/tecnologias.php` | Lista tecnologias ativas |
| POST | `/api/contato.php` | Valida e grava um contato |

## Funcionalidades atuais

- páginas Início, Sobre, Projetos, Catálogo, Contato e Gestão;
- projetos e tecnologias carregados da API PHP;
- formulário de contato reativo com validação no Angular e no PHP;
- CRUD de projetos na rota `/gestao`;
- seleção entre rascunho e publicado;
- mensagens visíveis de carregamento, erro, sucesso e lista vazia;
- navegação e formulários adaptados para telas pequenas e uso por teclado.

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

## Verificações realizadas nesta implementação

- `npm install`: concluído;
- `npm run build`: concluído sem erros de TypeScript ou template;
- `npm test -- --watch=false`: 6 arquivos e 10 testes aprovados;
- servidor Angular: `/`, `/projetos`, `/catalogo`, `/contato` e `/gestao` responderam HTTP 200;
- `php -l` e curls da API: não executados, pois PHP e MariaDB não estão instalados;
- inspeção visual automatizada: não executada, pois não havia navegador conectado ao ambiente.

## Histórico — Aula 16

O projeto começou como a estrutura visual do portfólio. Na Aula 16 foram criados os componentes Home, Sobre, Projetos e Contato, as rotas com `routerLink`/`router-outlet` e a barra de navegação com Angular Material. As Aulas 17, 18 e 19 evoluíram essa base sem reescrever o projeto.

## Autor

**Rafael Freire** — aluno do curso Técnico em Informática do IFPR CRPG.
