"use client"

import { createContext, useContext, useState } from "react"

type ItemCarrinho = {
  id: number
  nome: string
  preco: number
  imagem: string
  tamanho: string
  cor: string
  quantidade: number
}

type CarrinhoContextType = {
  itens: ItemCarrinho[]

  adicionar: (produto: {
    id: number
    nome: string
    preco: number
    imagem: string
    tamanho: string
    cor: string
    quantidade: number
  }) => void

  remover: (
    id: number,
    tamanho: string,
    cor: string
  ) => void

  alterarQuantidade: (
    id: number,
    tamanho: string,
    cor: string,
    quantidade: number
  ) => void

  limpar: () => void

  total: number
  quantidadeTotal: number
}

const CarrinhoContext = createContext<CarrinhoContextType | null>(null)

export function CarrinhoProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [itens, setItens] = useState<ItemCarrinho[]>([])

  function adicionar(produto: {
    id: number
    nome: string
    preco: number
    imagem: string
    tamanho: string
    cor: string
    quantidade: number
  }) {
    setItens((atuais) => {
      const existente = atuais.find(
        (item) =>
          item.id === produto.id &&
          item.tamanho === produto.tamanho &&
          item.cor === produto.cor
      )

      if (existente) {
        return atuais.map((item) =>
          item.id === produto.id &&
          item.tamanho === produto.tamanho &&
          item.cor === produto.cor
            ? {
                ...item,
                quantidade:
                  item.quantidade + produto.quantidade,
              }
            : item
        )
      }

      return [
        ...atuais,
        {
          ...produto,
          quantidade: Number(produto.quantidade) || 1,
        },
      ]
    })
  }

  function remover(
    id: number,
    tamanho: string,
    cor: string
  ) {
    setItens((atuais) =>
      atuais.filter(
        (item) =>
          !(
            item.id === id &&
            item.tamanho === tamanho &&
            item.cor === cor
          )
      )
    )
  }

  function alterarQuantidade(
    id: number,
    tamanho: string,
    cor: string,
    quantidade: number
  ) {
    if (quantidade < 1) return

    setItens((atuais) =>
      atuais.map((item) =>
        item.id === id &&
        item.tamanho === tamanho &&
        item.cor === cor
          ? {
              ...item,
              quantidade,
            }
          : item
      )
    )
  }

  // 🗑️ Limpa todos os produtos do carrinho
  function limpar() {
    setItens([])
  }

  const total = itens.reduce(
    (soma, item) =>
      soma + item.preco * item.quantidade,
    0
  )

  const quantidadeTotal = itens.reduce(
    (soma, item) =>
      soma + item.quantidade,
    0
  )

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionar,
        remover,
        alterarQuantidade,
        limpar,
        total,
        quantidadeTotal,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const contexto = useContext(CarrinhoContext)

  if (!contexto) {
    throw new Error(
      "useCarrinho precisa estar dentro do CarrinhoProvider"
    )
  }

  return contexto
}