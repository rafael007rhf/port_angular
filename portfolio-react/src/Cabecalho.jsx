export default function Cabecalho() {
  return (
    <header>
      <div className="barra">
        <a className="marca" href="#inicio" aria-label="Rafael Freire — início">RF<span>.</span></a>
        <h1>Rafael Freire</h1>
        <nav aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#sobre">Sobre</a>
          <a href="#projetos">Projetos</a>
          <a href="#contato">Contato</a>
        </nav>
      </div>
    </header>
  );
}
