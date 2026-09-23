"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useCategoria } from "@/components/categoria-context"

type Produto = {
  id: number
  categoria: string
  imagem: string
}

type ProdutoCategoria = {
  produto_id: number
  categoria_principal: string
  subcategoria: string | null
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

export default function CategoriasFotos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosCategorias, setProdutosCategorias] =
    useState<ProdutoCategoria[]>([])

  const [categoriaAberta, setCategoriaAberta] =
    useState<Categoria | null>(null)

  const {
    setCategoria,
    setSubcategoria,
  } = useCategoria()

  useEffect(() => {
    async function carregarDados() {
      const [
        { data: produtosData, error: erroProdutos },
        {
          data: categoriasData,
          error: erroCategorias,
        },
      ] = await Promise.all([
        supabase
          .from("produtos")
          .select("id, categoria, imagem"),

        supabase
          .from("produto_categorias")
          .select(
            "produto_id, categoria_principal, subcategoria"
          ),
      ])

      if (erroProdutos) {
        console.error(
          "Erro ao carregar imagens dos produtos:",
          erroProdutos.message,
          erroProdutos.details,
          erroProdutos.hint
        )
        return
      }

      if (erroCategorias) {
        console.error(
          "Erro ao carregar categorias dos produtos:",
          erroCategorias.message,
          erroCategorias.details,
          erroCategorias.hint
        )
        return
      }

      setProdutos(produtosData || [])
      setProdutosCategorias(
        categoriasData || []
      )
    }

    carregarDados()
  }, [])

  // =========================================
  // PEGA IMAGEM DE UMA CATEGORIA PRINCIPAL
  // =========================================

  function pegarImagemCategoria(
    categoria: string
  ) {
    // Primeiro tenta encontrar através
    // da nova tabela de categorias
    const associacao =
      produtosCategorias.find(
        (item) =>
          item.categoria_principal ===
            categoria &&
          item.produto_id
      )

    if (associacao) {
      const produto = produtos.find(
        (item) =>
          item.id === associacao.produto_id
      )

      if (produto?.imagem) {
        return produto.imagem
      }
    }

    // Fallback para produtos antigos
    const produtoAntigo =
      produtos.find(
        (produto) =>
          produto.categoria === categoria
      )

    return produtoAntigo?.imagem || ""
  }

  // =========================================
  // PEGA IMAGEM DE UMA SUBCATEGORIA
  // =========================================

  function pegarImagemSubcategoria(
    categoriaPrincipal: string,
    subcategoria: string
  ) {
    // Procura uma associação EXATA
    const associacao =
      produtosCategorias.find(
        (item) =>
          item.categoria_principal ===
            categoriaPrincipal &&
          item.subcategoria === subcategoria
      )

    if (!associacao) {
      return ""
    }

    const produto = produtos.find(
      (item) =>
        item.id === associacao.produto_id
    )

    return produto?.imagem || ""
  }

  function selecionarCategoria(
    categoria: Categoria
  ) {
    if (categoria.subcategorias) {
      setCategoriaAberta(categoria)
      return
    }

    setCategoria(categoria.valor)
    setSubcategoria(null)
  }

  function selecionarSubcategoria(
    subcategoria: {
      nome: string
      valor: string
    }
  ) {
    if (!categoriaAberta) return

    setCategoria(categoriaAberta.valor)
    setSubcategoria(subcategoria.valor)

    setCategoriaAberta(null)
  }

  function voltarCategorias() {
    setCategoriaAberta(null)
  }

  // =========================================
  // TELA DE SUBCATEGORIAS
  // =========================================

  if (categoriaAberta) {
    return (
      <section className="px-4 py-6 md:px-8 md:py-8">
        <button
          type="button"
          onClick={voltarCategorias}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-roxo hover:underline"
        >
          ← Voltar para categorias
        </button>

        <h2 className="mb-5 text-xl font-bold text-roxo md:text-3xl">
          {categoriaAberta.nome}
        </h2>

        <div
          className="
            flex
            gap-5
            overflow-x-auto
            pb-3
            scrollbar-hide

            md:grid
            md:grid-cols-4
            md:gap-6
            md:overflow-visible
            md:pb-0
          "
        >
          {categoriaAberta.subcategorias?.map(
            (subcategoria) => {
              const imagem =
                pegarImagemSubcategoria(
                  categoriaAberta.valor,
                  subcategoria.valor
                )

              return (
                <button
                  key={subcategoria.valor}
                  type="button"
                  onClick={() =>
                    selecionarSubcategoria(
                      subcategoria
                    )
                  }
                  className="
                    flex
                    min-w-[90px]
                    flex-col
                    items-center
                    text-center
                    transition
                    hover:scale-105

                    md:min-w-0
                  "
                >
                  <div
                    className="
                      h-20
                      w-20
                      overflow-hidden
                      rounded-full
                      border-2
                      border-lilas
                      bg-gray-100

                      md:h-32
                      md:w-32
                      md:border-[3px]
                    "
                  >
                    {imagem ? (
                      <img
                        src={imagem}
                        alt={subcategoria.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Sem foto
                      </div>
                    )}
                  </div>

                  <span
                    className="
                      mt-2
                      text-sm
                      font-medium
                      text-roxo

                      md:mt-3
                      md:text-base
                    "
                  >
                    {subcategoria.nome}
                  </span>
                </button>
              )
            }
          )}
        </div>
      </section>
    )
  }

  // =========================================
  // CATEGORIAS PRINCIPAIS
  // =========================================

  return (
    <section className="px-4 py-6 md:px-8 md:py-8">
      <h2 className="mb-5 text-xl font-bold text-roxo md:text-3xl">
        Categorias
      </h2>

      <div
        className="
          flex
          gap-5
          overflow-x-auto
          pb-3
          scrollbar-hide

          md:grid
          md:grid-cols-4
          md:gap-6
          md:overflow-visible
          md:pb-0

          lg:grid-cols-8
        "
      >
        {categorias.map((categoria) => {
          const imagem =
            pegarImagemCategoria(
              categoria.valor
            )

          return (
            <button
              key={categoria.valor}
              type="button"
              onClick={() =>
                selecionarCategoria(
                  categoria
                )
              }
              className="
                flex
                min-w-[90px]
                flex-col
                items-center
                text-center
                transition
                hover:scale-105

                md:min-w-0
              "
            >
              <div
                className="
                  h-20
                  w-20
                  overflow-hidden
                  rounded-full
                  border-2
                  border-lilas
                  bg-gray-100

                  md:h-32
                  md:w-32
                  md:border-[3px]
                "
              >
                {imagem ? (
                  <img
                    src={imagem}
                    alt={categoria.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    Sem foto
                  </div>
                )}
              </div>

              <span
                className="
                  mt-2
                  text-sm
                  font-medium
                  text-roxo

                  md:mt-3
                  md:text-base
                "
              >
                {categoria.nome}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}