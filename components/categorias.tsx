"use client"

import { useState } from "react"
import { useCategoria } from "@/components/categoria-context"

interface CategoriasProps {
  aberto: boolean
  fechar: () => void
  selecionarCategoria: (categoria: string) => void
}

type Categoria = {
  nome: string
  valor: string
  subcategorias?: {
    nome: string
    valor: string
  }[]
}

const categorias: Categoria[] = [
  {
    nome: "Blusas",
    valor: "blusas",
    subcategorias: [
      {
        nome: "Blusas Casuais",
        valor: "blusas-casuais",
      },
      {
        nome: "Blusas Sociais",
        valor: "blusas-sociais",
      },
      {
        nome: "Croppeds & Justinhas",
        valor: "croppeds-justinhas",
      },
      {
        nome: "T-shirts",
        valor: "t-shirts",
      },
    ],
  },

  {
    nome: "Calças",
    valor: "calcas",
  },

  {
    nome: "Shorts & Saias",
    valor: "shorts-e-saias",
    subcategorias: [
      {
        nome: "Shorts",
        valor: "shorts",
      },
      {
        nome: "Saias",
        valor: "saias",
      },
    ],
  },

  {
    nome: "Vestidos",
    valor: "vestidos",
    subcategorias: [
      {
        nome: "Vestidos Casuais",
        valor: "vestidos-casuais",
      },
      {
        nome: "Vestidos Sociais",
        valor: "vestidos-sociais",
      },
      {
        nome: "Vestidos Justos",
        valor: "vestidos-justos",
      },
    ],
  },

  {
    nome: "Conjuntos",
    valor: "conjuntos",
  },

  {
    nome: "Moda Cristã",
    valor: "moda-crista",
    subcategorias: [
      {
        nome: "Saias",
        valor: "moda-crista-saias",
      },
      {
        nome: "Vestidos",
        valor: "moda-crista-vestidos",
      },
      {
        nome: "T-shirts com frases",
        valor: "t-shirts-com-frases",
      },
      {
        nome: "Blusas",
        valor: "moda-crista-blusas",
      },
    ],
  },

  {
    nome: "Acessórios",
    valor: "acessorios",
  },

  {
    nome: "Coleção Inverno",
    valor: "colecao-inverno",
  },
]

export default function Categorias({
  aberto,
  fechar,
  selecionarCategoria,
}: CategoriasProps) {
  const {
    setCategoria,
    setSubcategoria,
  } = useCategoria()

  const [categoriaAberta, setCategoriaAberta] =
    useState<Categoria | null>(null)

  function escolherCategoria(categoria: Categoria) {
    // Categoria sem subcategorias
    if (!categoria.subcategorias) {
      setCategoria(categoria.valor)
      setSubcategoria(null)

      selecionarCategoria(categoria.valor)

      fechar()

      return
    }

    // Categoria com subcategorias
    setCategoriaAberta(categoria)
  }

  function escolherSubcategoria(
    subcategoria: {
      nome: string
      valor: string
    }
  ) {
    if (!categoriaAberta) return

    setCategoria(categoriaAberta.valor)
    setSubcategoria(subcategoria.valor)

    selecionarCategoria(categoriaAberta.valor)

    setCategoriaAberta(null)
    fechar()
  }

  function voltarCategorias() {
    setCategoriaAberta(null)
  }

  function fecharMenu() {
    setCategoriaAberta(null)
    fechar()
  }

  return (
    <>
      {aberto && (
        <div
          className="fundo-menu"
          onClick={fecharMenu}
        />
      )}

      <aside
        className={`menu-categorias ${
          aberto ? "aberto" : ""
        }`}
      >
        <div className="cabecalho-categorias">
          <h2>
            {categoriaAberta
              ? categoriaAberta.nome
              : "Categorias"}
          </h2>

          <button onClick={fecharMenu}>
            ✕
          </button>
        </div>

        <div className="lista-categorias">
          {/* =====================================
              SUBCATEGORIAS
          ===================================== */}

          {categoriaAberta ? (
            <>
              <button
                onClick={voltarCategorias}
              >
                ← Voltar
              </button>

              {categoriaAberta.subcategorias?.map(
                (subcategoria) => (
                  <button
                    key={subcategoria.valor}
                    onClick={() =>
                      escolherSubcategoria(
                        subcategoria
                      )
                    }
                  >
                    {subcategoria.nome}
                  </button>
                )
              )}
            </>
          ) : (
            <>
              {/* =====================================
                  TODAS
              ===================================== */}

              <button
                onClick={() => {
                  setCategoria("todas")
                  setSubcategoria(null)

                  selecionarCategoria("todas")

                  fechar()
                }}
              >
                Todas
              </button>

              {/* =====================================
                  CATEGORIAS
              ===================================== */}

              {categorias.map((categoria) => (
                <button
                  key={categoria.valor}
                  onClick={() =>
                    escolherCategoria(
                      categoria
                    )
                  }
                >
                  {categoria.nome}

                  {categoria.subcategorias && (
                    <span className="ml-2">
                      ›
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  )
}