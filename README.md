# Port Angular

Projeto de portfólio pessoal desenvolvido com Angular, com o objetivo de apresentar informações profissionais, habilidades, projetos, experiências e formas de contato em uma interface moderna, responsiva e organizada.

## Sobre o projeto

É um portfólio do aluno **Rafael Freire**, desenvolvido para a disciplina **Desenvolvimento Web III**, do **IFPR - Campus Curitiba, Centro de Referência de Ponta Grossa**.

O projeto foi criado com Angular e tem como objetivo principal servir como uma página pessoal/profissional, reunindo informações sobre o desenvolvedor, suas habilidades técnicas, projetos desenvolvidos e formas de contato.

Além disso, o projeto também foi utilizado como prática dos principais conceitos de desenvolvimento front-end com Angular, como criação de componentes, organização da aplicação, uso de rotas, navegação entre páginas e aplicação de elementos visuais com Angular Material.

## Objetivos do projeto

O projeto tem como principais objetivos:

* Apresentar o perfil do desenvolvedor de forma clara e profissional;
* Exibir habilidades técnicas e conhecimentos na área de tecnologia;
* Mostrar projetos já desenvolvidos;
* Praticar conceitos de desenvolvimento front-end com Angular;
* Trabalhar com componentes reutilizáveis;
* Criar uma aplicação com múltiplas páginas;
* Utilizar navegação por rotas;
* Aplicar componentes visuais do Angular Material;
* Organizar o projeto de forma limpa e estruturada;
* Versionar o progresso do desenvolvimento utilizando Git e GitHub.

## Versão das tecnologias

As versões utilizadas no desenvolvimento do projeto foram:

* npm: 11.9.0
* node: v24.14.0
* Angular CLI: 21.2.13
* Angular Material: utilizado para componentes visuais da interface

## Funcionalidades

A aplicação pode conter as seguintes seções e funcionalidades:

* Página inicial com apresentação;
* Seção sobre o desenvolvedor;
* Lista de habilidades técnicas;
* Área de projetos;
* Links para GitHub, LinkedIn ou outras redes;
* Seção de contato;
* Layout responsivo para computador, tablet e celular;
* Organização por componentes Angular;
* Navegação entre páginas sem recarregar o site;
* Interface com elementos do Angular Material;
* Estrutura preparada para futuras melhorias.

## O que foi desenvolvido na aula

Durante a aula, o projeto deixou de ser apenas uma tela simples e passou a ter uma estrutura inicial de portfólio navegável.

Foram trabalhados os conceitos de **componentes**, **layout** e **navegação** dentro do Angular. A proposta foi criar a “casca” do portfólio, ou seja, a estrutura base da aplicação, com páginas separadas e links de navegação entre elas.

A aplicação passou a contar com quatro páginas principais:

* Home;
* Sobre;
* Projetos;
* Contato.

Cada uma dessas páginas foi criada como um componente independente, seguindo a organização padrão do Angular.

## Componentes criados

Foram gerados quatro componentes principais utilizando o Angular CLI:

```bash
ng generate component home
ng generate component sobre
ng generate component projetos
ng generate component contato
```

Esses comandos criaram as pastas e arquivos de cada componente dentro de `src/app`.

Cada componente possui sua própria estrutura, contendo arquivos de template HTML, estilo CSS, arquivo TypeScript e arquivo de teste.

A criação desses componentes permite separar melhor cada parte do site, deixando o projeto mais organizado e fácil de manter.

## Página Home

A página **Home** foi criada para ser a tela inicial do portfólio.

Ela apresenta uma introdução sobre o desenvolvedor e funciona como porta de entrada para o site.

Nessa página foi utilizado o componente `mat-card` do Angular Material para criar um cartão visual com título, subtítulo e conteúdo.

Exemplo da ideia implementada:

```html
<mat-card>
  <mat-card-header>
    <mat-card-title>Olá, eu sou Rafael Freire!</mat-card-title>
    <mat-card-subtitle>Técnico em Informática - IFPR CRPG</mat-card-subtitle>
  </mat-card-header>

  <mat-card-content>
    <p>
      Seja bem-vindo ao meu portfólio desenvolvido com Angular.
      Aqui você poderá conhecer melhor minha trajetória, meus projetos,
      minhas habilidades e meus interesses na área da tecnologia.
    </p>
  </mat-card-content>
</mat-card>
```

## Página Sobre

A página **Sobre** foi estruturada para apresentar informações mais completas sobre o aluno.

Ela contém uma descrição pessoal e acadêmica, explicando quem é o desenvolvedor, sua formação, seus interesses na área de tecnologia e o objetivo do portfólio.

Essa página também utiliza `mat-card`, seguindo o mesmo padrão visual da página inicial.

O conteúdo foi organizado em seções, como:

* Quem sou eu;
* Áreas de interesse;
* Objetivo;
* Sobre o portfólio.

## Página Projetos

A página **Projetos** foi criada para futuramente exibir os principais trabalhos desenvolvidos pelo aluno.

Ela servirá como uma área para listar projetos acadêmicos, pessoais ou profissionais, mostrando informações como nome do projeto, descrição, tecnologias utilizadas e possíveis links para repositórios ou demonstrações.

Nesta etapa, a página foi criada como componente, ficando preparada para receber conteúdo nas próximas aulas.

## Página Contato

A página **Contato** foi criada para futuramente reunir formas de comunicação com o desenvolvedor.

Ela poderá conter informações como:

* E-mail;
* GitHub;
* LinkedIn;
* Outras redes profissionais;
* Formulário de contato.

Nesta aula, o principal objetivo foi criar a estrutura do componente e deixá-lo conectado à navegação da aplicação.

## Navegação entre páginas

Foi configurada a navegação entre as páginas utilizando o sistema de rotas do Angular.

As rotas permitem que o usuário acesse diferentes páginas do portfólio sem que o site seja completamente recarregado.

Foram configuradas rotas para:

```ts
{ path: '', component: Home }
{ path: 'sobre', component: Sobre }
{ path: 'projetos', component: Projetos }
{ path: 'contato', component: Contato }
```

A rota vazia (`''`) representa a página inicial do site, ou seja, a Home.

## Uso do routerLink

Para navegar entre as páginas, foi utilizado o `routerLink`.

O `routerLink` funciona de forma parecida com o `href` do HTML, mas com uma diferença importante: ele troca o conteúdo exibido na aplicação sem recarregar a página inteira.

Exemplo:

```html
<a mat-button routerLink="/">Início</a>
<a mat-button routerLink="/sobre">Sobre</a>
<a mat-button routerLink="/projetos">Projetos</a>
<a mat-button routerLink="/contato">Contato</a>
```

Isso torna a aplicação mais fluida e mais parecida com um sistema moderno de página única, conhecido como SPA, ou Single Page Application.

## Uso do router-outlet

Também foi utilizado o `router-outlet`, que é o local onde o Angular renderiza o componente correspondente à rota acessada.

Exemplo:

```html
<router-outlet></router-outlet>
```

Quando o usuário clica em “Sobre”, por exemplo, o Angular carrega o componente Sobre dentro do `router-outlet`.

## Angular Material

O projeto utiliza Angular Material para melhorar a aparência da interface.

Durante a aula, foram utilizados componentes visuais como:

* `mat-toolbar`, para a barra de navegação;
* `mat-button`, para os botões/links do menu;
* `mat-card`, para os cartões de conteúdo.

Esses componentes ajudam a deixar o portfólio com visual mais moderno, organizado e padronizado.

## Layout da aplicação

O layout principal do projeto foi organizado com uma barra superior de navegação e uma área central para exibição do conteúdo.

A estrutura geral da aplicação segue a ideia:

```html
<mat-toolbar color="primary">
  <span>Meu Portfólio</span>

  <span class="spacer"></span>

  <a mat-button routerLink="/">Início</a>
  <a mat-button routerLink="/sobre">Sobre</a>
  <a mat-button routerLink="/projetos">Projetos</a>
  <a mat-button routerLink="/contato">Contato</a>
</mat-toolbar>

<main class="container">
  <router-outlet></router-outlet>
</main>
```

A barra de navegação permite acessar as páginas principais do portfólio, enquanto o `router-outlet` exibe o conteúdo de cada página.

## Organização do projeto

A estrutura principal do projeto ficou organizada em componentes dentro da pasta `src/app`.

Exemplo de organização:

```text
src/
└── app/
    ├── home/
    │   ├── home.html
    │   ├── home.css
    │   ├── home.ts
    │   └── home.spec.ts
    │
    ├── sobre/
    │   ├── sobre.html
    │   ├── sobre.css
    │   ├── sobre.ts
    │   └── sobre.spec.ts
    │
    ├── projetos/
    │   ├── projetos.html
    │   ├── projetos.css
    │   ├── projetos.ts
    │   └── projetos.spec.ts
    │
    ├── contato/
    │   ├── contato.html
    │   ├── contato.css
    │   ├── contato.ts
    │   └── contato.spec.ts
    │
    ├── app.html
    ├── app.css
    ├── app.ts
    └── app.routes.ts
```

Essa organização facilita a manutenção e evolução do projeto, pois cada página possui seus próprios arquivos.

## Como executar o projeto

Para executar o projeto localmente, primeiro é necessário instalar as dependências:

```bash
npm install
```

Depois, basta iniciar o servidor de desenvolvimento:

```bash
ng serve
```

Em seguida, acesse no navegador:

```text
http://localhost:4200
```

Caso esteja utilizando GitHub Codespaces, basta abrir a aba de portas e acessar a porta `4200`.

## Comandos utilizados na aula

Durante o desenvolvimento da aula, foram utilizados comandos como:

```bash
cd portfolio-angular
ng serve
```

Para gerar os componentes:

```bash
ng generate component home
ng generate component sobre
ng generate component projetos
ng generate component contato
```

Para salvar as alterações no GitHub:

```bash
git add .
git commit -m "Aula16: Cria componentes, navegacao com Material e rotas do Portfolio"
git push
```

## Aprendizados da aula

Com essa aula, foi possível praticar os seguintes conceitos:

* Criação de componentes Angular;
* Separação da aplicação em páginas;
* Organização da estrutura do projeto;
* Utilização de rotas;
* Navegação entre telas com `routerLink`;
* Exibição dinâmica de componentes com `router-outlet`;
* Uso de Angular Material;
* Criação de barra de navegação;
* Uso de cartões com `mat-card`;
* Versionamento do projeto no GitHub;
* Construção da estrutura inicial de um portfólio profissional.

## Status do projeto

O projeto está em desenvolvimento.

A estrutura inicial já foi criada, contendo as páginas principais e a navegação entre elas. Nas próximas etapas, o portfólio poderá receber mais conteúdo, como projetos reais, habilidades técnicas, links externos, informações de contato e melhorias visuais.

## Possíveis melhorias futuras

Algumas melhorias que podem ser adicionadas futuramente:

* Adicionar lista de habilidades com ícones;
* Criar cards para projetos;
* Inserir links para GitHub e LinkedIn;
* Criar formulário de contato;
* Melhorar o design responsivo;
* Adicionar animações;
* Criar rodapé;
* Personalizar cores e identidade visual;
* Adicionar imagens ou avatar;
* Publicar o projeto online.

## Autor

**Rafael Freire**

Aluno do curso Técnico em Informática do IFPR CRPG.

Projeto desenvolvido para a disciplina de Desenvolvimento Web III.
