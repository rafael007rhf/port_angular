// Nível A: uma prop com o mesmo objeto Projeto usado pelo contrato da API.
export default function CardProjeto({ projeto }) {
  return (
    <article className="card">
      <span className="etiqueta">{projeto.ano} · Desenvolvimento web</span>
      <h3>{projeto.nome}</h3>
      <p className="meta">{projeto.tecnologias}</p>
      <p>{projeto.descricao}</p>
      {projeto.link_github && (
        <a href={projeto.link_github} target="_blank" rel="noopener noreferrer">Ver no GitHub <span aria-hidden="true">↗</span></a>
      )}
    </article>
  );
}
