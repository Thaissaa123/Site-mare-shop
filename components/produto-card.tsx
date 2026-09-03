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

  return (
    <>
      <button
        onClick={() => setDetalhesAberto(true)}
        className="w-full text-left rounded-lg overflow-hidden border border-lilas bg-white"
      >
        <img
          src={imagem || "/placeholder.svg"}
          alt={nome}
          className="w-full h-48 object-cover"
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