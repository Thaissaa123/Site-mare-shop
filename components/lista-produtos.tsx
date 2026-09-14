"use client"

import { useEffect, useState } from "react"
import ProdutoCard from "@/components/produto-card"
import { useCategoria } from "@/components/categoria-context"
import { useBusca } from "@/components/busca-context"
import { supabase } from "@/lib/supabase"

type FotoProduto = {
  id: number
  produto_id: number
  cor: string
  imagem: string
  ordem: number
}

type Produto = {
  id: number
  nome: string
  preco: number
  categoria: string
  imagem: string
  tamanhos: string[]
  cores: string[]

  // Mantido temporariamente para o ProdutoCard atual.
  // Depois vamos substituir pelo sistema novo.
  variacoes: {
    nome: string
    imagem: string
  }[]

  // Fotos vindas da nova tabela fotos_produto
  fotos: FotoProduto[]
}

export default function ListaProdutos() {
  const { categoria } = useCategoria()
  const { busca } = useBusca()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function buscarProdutos() {
      setCarregando(true)

      // =========================
      // BUSCAR PRODUTOS
      // =========================

      const {
        data: produtosData,
        error: erroProdutos,
      } = await supabase
        .from("produtos")
        .select("*")
        .order("id", { ascending: true })

      if (erroProdutos) {
        console.error("ERRO AO BUSCAR PRODUTOS:", {
          mensagem: erroProdutos.message,
          detalhes: erroProdutos.details,
          dica: erroProdutos.hint,
          codigo: erroProdutos.code,
        })

        setCarregando(false)
        return
      }

      if (!produtosData || produtosData.length === 0) {
        setProdutos([])
        setCarregando(false)
        return
      }

      // =========================
      // BUSCAR FOTOS DOS PRODUTOS
      // =========================

      const {
        data: fotosData,
        error: erroFotos,
      } = await supabase
        .from("fotos_produto")
        .select("*")
        .order("ordem", { ascending: true })

      if (erroFotos) {
        console.error("ERRO AO BUSCAR FOTOS DOS PRODUTOS:", {
          mensagem: erroFotos.message,
          detalhes: erroFotos.details,
          dica: erroFotos.hint,
          codigo: erroFotos.code,
        })

        // Mesmo que as fotos tenham erro,
        // ainda mostramos os produtos normalmente.
        setProdutos(
          produtosData.map((produto) => ({
            ...produto,
            variacoes: [],
            fotos: [],
          }))
        )

        setCarregando(false)
        return
      }

      // =========================
      // JUNTAR PRODUTOS + FOTOS
      // =========================

      const produtosComFotos: Produto[] =
        produtosData.map((produto) => {
          const fotosDoProduto =
            (fotosData || [])
              .filter(
                (foto) =>
                  foto.produto_id === produto.id
              )
              .sort(
                (a, b) =>
                  (a.ordem || 0) -
                  (b.ordem || 0)
              )

          return {
            ...produto,

            fotos: fotosDoProduto,

            // Compatibilidade com o ProdutoCard atual.
            // Cada foto da nova tabela vira temporariamente
            // uma "variação".
            variacoes: fotosDoProduto.map(
              (foto) => ({
                nome: foto.cor,
                imagem: foto.imagem,
              })
            ),
          }
        })

      console.log(
        "PRODUTOS COM FOTOS:",
        produtosComFotos
      )

      setProdutos(produtosComFotos)
      setCarregando(false)
    }

    buscarProdutos()
  }, [])

  // =========================
  // TÍTULO DA CATEGORIA
  // =========================

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

  // =========================
  // FILTRAR PRODUTOS
  // =========================

  const produtosFiltrados = produtos.filter(
    (produto) => {
      const pertenceCategoria =
        categoria === "todas" ||
        produto.categoria === categoria

      const termoBusca = busca
        .toLowerCase()
        .trim()
        .replace(/s$/, "")

      const correspondeBusca =
        produto.nome
          .toLowerCase()
          .includes(termoBusca)

      return (
        pertenceCategoria &&
        correspondeBusca
      )
    }
  )

  // =========================
  // CARREGANDO
  // =========================

  if (carregando) {
    return (
      <section className="px-4 py-6">
        <p className="text-center text-gray-500">
          Carregando produtos...
        </p>
      </section>
    )
  }

  // =========================
  // LISTA
  // =========================

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

          produtosFiltrados.map(
            (produto) => (
              <ProdutoCard
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                preco={produto.preco}
                tamanhos={produto.tamanhos}
                cores={produto.cores}
                imagem={
  produto.fotos.length > 0
    ? produto.fotos[0].imagem
    : produto.imagem
}

                // Temporariamente recebe as fotos
                // da nova tabela através deste campo.
                variacoes={
                  produto.variacoes
                }
              />
            )
          )

        )}

      </div>

    </section>
  )
}