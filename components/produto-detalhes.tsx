"use client"

import { useState } from "react"
import { useCarrinho } from "@/components/carrinho-context"

type ProdutoDetalhesProps = {
  aberto: boolean
  fechar: () => void
  id: number
  nome: string
  preco: number
  imagem: string
  tamanhos: string[]
  cores: string[]
}

export default function ProdutoDetalhes({
  aberto,
  fechar,
  id,
  nome,
  preco,
  imagem,
  tamanhos,
  cores,
}: ProdutoDetalhesProps) {
  const [tamanho, setTamanho] = useState("")
  const [cor, setCor] = useState("")
  const [quantidade, setQuantidade] = useState(1)
  const [adicionado, setAdicionado] = useState(false)
  const { adicionar } = useCarrinho()

  console.log("TAMANHOS:", tamanhos)
  console.log("CORES:", cores)
  if (!aberto) return null

  // Temporário!
  // Depois essas opções virão do cadastro da sua mãe.


  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">

      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">

        <div className="relative">
  {/* Foto */}
  <img
    src={imagem || "/placeholder.svg"}
    alt={nome}
    className="w-full h-80 object-cover"
  />

  {/* Botão X */}
  <button
    onClick={fechar}
    aria-label="Fechar detalhes do produto"
    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 text-gray-700 text-2xl flex items-center justify-center shadow-md"
  >
    ×
  </button>
</div>
      

        <div className="p-5">

          {/* Nome e preço */}
          <h2 className="text-2xl font-bold text-foreground">
            {nome}
          </h2>

          <p className="text-xl font-bold text-roxo mt-2">
            R$ {preco.toFixed(2)}
          </p>

          {/* Tamanhos */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">
              Escolha o tamanho
            </h3>

            <div className="flex flex-wrap gap-2">
              
            {tamanhos.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => setTamanho(opcao)}
                  className={`px-5 py-2 rounded-full border ${
                    tamanho === opcao
                      ? "bg-roxo text-white border-roxo"
                      : "border-lilas text-foreground"
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>

          {/* Cores */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">
              Escolha a cor
            </h3>

            <div className="flex flex-wrap gap-2">
            {cores.map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => setCor(opcao)}
                  className={`px-4 py-2 rounded-full border ${
                    cor === opcao
                      ? "bg-roxo text-white border-roxo"
                      : "border-lilas text-foreground"
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
<div className="mt-6">
  <h3 className="font-semibold mb-3 text-gray-800">
    Quantidade
  </h3>

  <div className="flex items-center gap-2">

    <button
      type="button"
      onClick={() =>
        setQuantidade((q) => Math.max(1, q - 1))
      }
      className="w-10 h-10 rounded-full bg-lilas text-roxo text-xl font-bold flex items-center justify-center"
    >
      −
    </button>

    <div className="w-12 h-10 border-2 border-roxo rounded-lg bg-white flex items-center justify-center">
      <span className="text-black font-bold text-lg">
        {quantidade}
      </span>
    </div>

    <button
      type="button"
      onClick={() =>
        setQuantidade((q) => q + 1)
      }
      className="w-10 h-10 rounded-full bg-roxo text-white text-xl font-bold flex items-center justify-center"
    >
      +
    </button>

  </div>
</div>

          {/* Botão */}
      <button
  onClick={() => {
    if (!tamanho || !cor) {
      alert("Escolha o tamanho e a cor antes de adicionar ao carrinho.")
      return
    }

    adicionar({
  id,
  nome,
  preco,
  imagem,
  tamanho,
  cor,
  quantidade,
})

setAdicionado(true)

setTimeout(() => {
  setAdicionado(false)
  fechar()
}, 1000)
  }}
  className="w-full mt-8 rounded-full bg-roxo text-white py-3 font-semibold"
>
 {adicionado
  ? "✓ Produto adicionado!"
  : "Adicionar ao carrinho"}
</button>

        </div>
      </div>
    </div>
  )
}