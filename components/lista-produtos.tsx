"use client"

import { useEffect, useState } from "react"
import ProdutoCard from "@/components/produto-card"
import { useCategoria } from "@/components/categoria-context"
import { useBusca } from "@/components/busca-context"
import { supabase } from "@/lib/supabase"

type Produto = {
  id: number
  nome: string
  preco: number
  categoria: string
  imagem: string
  tamanhos: string[]
  cores: string[]
}

export default function ListaProdutos() {
  const { categoria } = useCategoria()
  const { busca, setBusca } = useBusca()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function buscarProdutos() {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true })

      if (error) {
        console.error("Erro ao buscar produtos:", error)
        setCarregando(false)
        return
      }

      setProdutos(data || [])
      setCarregando(false)
    }

    buscarProdutos()
  }, [])

  const tituloCategoria =
    categoria === "todas"
      ? "Nossos produtos"
      : categoria === "vestidos"
        ? "Vestidos"
        : categoria === "blusas"
          ? "Blusas"
          : categoria === "saias"
            ? "Saias"
            : categoria === "acessorios"
              ? "Acessórios"
              : categoria

  const produtosFiltrados = produtos.filter((produto) => {
    const pertenceCategoria =
      categoria === "todas" ||
      produto.categoria === categoria

    const termoBusca = busca
      .toLowerCase()
      .trim()
      .replace(/s$/, "")

    const correspondeBusca =
      produto.nome.toLowerCase().includes(termoBusca)

    return pertenceCategoria && correspondeBusca
  })

  if (carregando) {
    return (
      <section className="px-4 py-6">
        <p className="text-center text-gray-500">
          Carregando produtos...
        </p>
      </section>
    )
  }

  return (
    <section className="px-4 py-6">

      <h2 className="text-xl font-bold text-roxo-escuro mb-4">
        {tituloCategoria}
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {produtosFiltrados.length === 0 ? (
          <div className="col-span-2 text-center py-10">

            <p className="text-4xl mb-3">
              🔍
            </p>

            <h3 className="text-lg font-semibold text-roxo-escuro">
              Nenhum produto encontrado
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Não encontramos produtos para sua busca.
            </p>

    <button
  onClick={() => {
    window.location.href = "/"
  }}
  className="mt-4 bg-roxo text-white px-5 py-2 rounded-full"
>
  Ver todos os produtos
</button>

          </div>
        ) : (

          produtosFiltrados.map((produto) => (
            <ProdutoCard
              key={produto.id}
              id={produto.id}
              nome={produto.nome}
              preco={produto.preco}
              tamanhos={produto.tamanhos}
              cores={produto.cores}
              imagem={produto.imagem}
            />
          ))

        )}

      </div>

    </section>
  )
}