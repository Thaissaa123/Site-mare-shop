"use client"

import { useState } from "react"
import { useCarrinho } from "@/components/carrinho-context"
import { useCategoria } from "@/components/categoria-context"
import Carrinho from "@/components/carrinho"
import Categorias from "@/components/categorias"
import { useBusca } from "@/components/busca-context"


export default function Header() {
  const { quantidadeTotal } = useCarrinho()

  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const { setCategoria } = useCategoria()
  const { busca, setBusca } = useBusca()


  return (
    <>
      <header className="bg-roxo text-white px-4 py-3">
        
        {/* Linha de cima */}
        <div className="flex items-center justify-between">

          {/* Botão do menu */}
          <button
            aria-label="Abrir categorias"
            className="text-2xl"
            onClick={() => setMenuAberto(true)}
          >
            ☰
          </button>

          {/* Nome da loja */}
          <h1 className="text-xl font-bold">
            Maré Shop
          </h1>

          {/* Botão do carrinho */}
          <button
            aria-label="Abrir carrinho"
            onClick={() => setCarrinhoAberto(true)}
            className="relative text-2xl"
          >
            🛒

            {quantidadeTotal > 0 && (
              <span className="absolute -top-1 -right-2 bg-white text-roxo text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {quantidadeTotal}
              </span>
            )}
          </button>

        </div>

        {/* Barra de pesquisa */}
        <div className="mt-3 relative">
  <input
    type="text"
    placeholder="Buscar roupas e acessórios..."
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    className="w-full rounded-full px-4 py-2 pr-10 bg-white text-black placeholder:text-gray-500 outline-none"
  />

  {busca && (
    <button
      onClick={() => setBusca("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"
      aria-label="Limpar pesquisa"
    >
      ✕
    </button>
  )}
</div>
        {/* Carrinho */}
        <Carrinho
          aberto={carrinhoAberto}
          aoFechar={() => setCarrinhoAberto(false)}
        />

      </header>

      {/* Menu de categorias */}
    <Categorias
  aberto={menuAberto}
  fechar={() => setMenuAberto(false)}
  selecionarCategoria={(categoria) => {
    setCategoria(categoria)
    setMenuAberto(false)
  }}
/>

    </>
  )
}