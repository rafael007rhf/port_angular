import Cabecalho from './Cabecalho.jsx';
import CardProjeto from './CardProjeto.jsx';
import Rodape from './Rodape.jsx';
import Secao from './Secao.jsx';

// Aula 25: três partes reais deste repositório. A API entra no front na Aula 27.
const projetoAngular = {
  id: 1, nome: 'Portfólio Angular', ano: 2026,
  descricao: 'Portfólio com navegação, catálogo, formulário de contato e área de gestão de projetos.',
  tecnologias: 'Angular · TypeScript · Angular Material',
  link_github: 'https://github.com/rafael007rhf/port_angular',
};
const projetoApi = {
  id: 2, nome: 'API do Portfólio', ano: 2026,
  descricao: 'API com consultas ao banco, CRUD de projetos e tecnologias e autenticação por token.',
  tecnologias: 'Node.js · Express · MariaDB · JWT',
  link_github: 'https://github.com/rafael007rhf/port_angular',
};
const projetoReact = {
  id: 3, nome: 'Portfólio React', ano: 2026,
  descricao: 'Uma nova interface construída com componentes reutilizáveis, props e JSX. Esta é a primeira etapa.',
  tecnologias: 'React · Vite · CSS',
  link_github: 'https://github.com/rafael007rhf/port_angular',
};

export default function App() {
  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <Cabecalho />
      <main id="conteudo">
        <section className="apresentacao" id="inicio" aria-labelledby="titulo-inicio">
          <p className="sobretitulo">PORTFÓLIO · 2026</p>
          <h2 id="titulo-inicio">Ideias que viram<br /><span>código.</span></h2>
          <p>Sou Rafael Freire, estudante de Informática no IFPR. Aqui compartilho o que estou construindo e aprendendo em desenvolvimento web.</p>
          <a className="botao" href="#projetos">Conheça meus projetos <span aria-hidden="true">↓</span></a>
        </section>
        <Secao id="sobre" titulo="Aprender construindo.">
          <p className="texto-sobre">Do primeiro componente à API com banco de dados: cada etapa deste portfólio registra a evolução do meu trabalho na disciplina de Desenvolvimento Web II.</p>
        </Secao>
        <Secao id="projetos" titulo="Projetos">
          <p>Três partes do mesmo percurso: interface, dados e novas ferramentas.</p>
          <div className="cards">
            <CardProjeto projeto={projetoAngular} />
            <CardProjeto projeto={projetoApi} />
            <CardProjeto projeto={projetoReact} />
          </div>
        </Secao>
      </main>
      <Rodape />
    </>
  );
}
