"use client"

import { useState } from "react"
import ProdutoDetalhes from "./produto-detalhes"

type ProdutoCardProps = {
  id: number
  nome: string
  preco: number
  imagem: string
  tamanhos: string[]
  cores: string[]
}

export default function ProdutoCard({
  id,
  nome,
  preco,
  imagem,
  tamanhos,
  cores,
}: ProdutoCardProps) {
  const [detalhesAberto, setDetalhesAberto] = useState(false)

  function abrirDetalhes() {
    setDetalhesAberto(true)
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-lilas bg-white">

        {/* Produto */}
        <button
          onClick={abrirDetalhes}
          className="w-full text-left"
        >
          <img
            src={imagem || "/placeholder.svg"}
            alt={nome}
            className="
              h-52
              w-full
              object-cover

              md:h-64
            "
          />

          <div className="p-3">
            <h3 className="font-medium text-foreground">
              {nome}
            </h3>

            <p className="mt-1 font-bold text-roxo">
              R$ {preco.toFixed(2)}
            </p>
          </div>
        </button>

        {/* Comprar */}
        <div className="px-3 pb-3">
          <button
            onClick={abrirDetalhes}
            className="
              w-full
              rounded-full
              bg-roxo
              px-4
              py-2
              font-medium
              text-white
              transition
              hover:opacity-90
            "
          >
            Comprar
          </button>
        </div>

      </div>

      <ProdutoDetalhes
        aberto={detalhesAberto}
        fechar={() => setDetalhesAberto(false)}
        id={id}
        nome={nome}
        preco={preco}
        imagem={imagem}
        tamanhos={tamanhos}
        cores={cores}
      />
    </>
  )
}