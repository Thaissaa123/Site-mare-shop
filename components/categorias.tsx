"use client";

interface CategoriasProps {
  aberto: boolean;
  fechar: () => void;
  selecionarCategoria: (categoria: string) => void;
}

export default function Categorias({
  aberto,
  fechar,
  selecionarCategoria,
}: CategoriasProps) {
  return (
    <>
      {aberto && (
        <div className="fundo-menu"
          onClick={fechar}
        />
      )}

      <aside className={`menu-categorias ${aberto ? "aberto" : ""}`}>
        <div className="cabecalho-categorias">
          <h2>Categorias</h2>

          <button onClick={fechar}>
            ✕
          </button>
        </div>

        <div className="lista-categorias">
          <button onClick={() => selecionarCategoria("todas")}>
            Todas
          </button>

          <button onClick={() => selecionarCategoria("blusas")}>
            Blusas
          </button>
          <button onClick={() => selecionarCategoria("calcas")}>
            Calças
          </button>
          
          <button onClick={() => selecionarCategoria("shorts-e-saias")}>
            Shorts e Saias 
          </button>


          <button onClick={() => selecionarCategoria("vestidos")}>
            Vestidos
          </button>

          <button onClick={() => selecionarCategoria("conjuntos")}>
            Conjuntos
          </button>

          <button onClick={() => selecionarCategoria("acessorios")}>
            Acessórios
          </button>
           
          <button onClick={() => selecionarCategoria("colecao-inverno")}>
            Coleção Inverno
          </button>

        
        </div>
         </aside>
    </>
  );
}