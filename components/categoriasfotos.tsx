"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useCategoria } from "@/components/categoria-context"

type Produto = {
  categoria: string
  imagem: string
}

const categorias = [
  {
    nome: "Vestidos",
    valor: "vestidos",
  },
  {
    nome: "Blusas",
    valor: "blusas",
  },
  {
    nome: "Calças",
    valor: "calcas",
  },
  {
    nome: "Shorts e Saias",
    valor: "shorts-e-saias",
  },
  {
    nome: "Conjuntos",
    valor: "conjuntos",
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
  const { setCategoria } = useCategoria()

  useEffect(() => {
    async function carregarProdutos() {
      const { data, error } = await supabase
        .from("produtos")
        .select("categoria, imagem")

      if (error) {
        console.error("Erro ao carregar imagens das categorias:", error)
        return
      }

      setProdutos(data || [])
    }

    carregarProdutos()
  }, [])

  function pegarImagem(categoria: string) {
    const produto = produtos.find(
      (produto) => produto.categoria === categoria
    )

    return produto?.imagem || "/placeholder.svg"
  }

  return (
    <section className="px-4 py-6 md:px-8 md:py-8">

      <h2 className="mb-5 text-xl font-bold text-roxo md:text-3xl">
        Categorias
      </h2>

      {/* Área das categorias */}
      <div
        className="
          flex
          gap-5
          overflow-x-auto
          pb-3
          scrollbar-hide

          md:grid
          md:grid-cols-7
          md:gap-6
          md:overflow-visible
          md:pb-0
        "
      >
        {categorias.map((categoria) => (
          <button
            key={categoria.valor}
            onClick={() => setCategoria(categoria.valor)}
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
            {/* Foto circular */}
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
              <img
                src={pegarImagem(categoria.valor)}
                alt={categoria.nome}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Nome */}
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
        ))}
      </div>
    </section>
  )
}