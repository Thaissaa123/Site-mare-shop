"use client"

import { useEffect, useState } from "react"
import ProdutoDetalhes from "./produto-detalhes"

type Variacao = {
  nome: string
  imagem: string
}

type ProdutoCardProps = {
  id: number
  nome: string
  preco: number
  imagem: string
  tamanhos: string[]
  cores: string[]
  variacoes: Variacao[]
}

export default function ProdutoCard({
  id,
  nome,
  preco,
  imagem,
  tamanhos,
  cores,
  variacoes,
}: ProdutoCardProps) {
  const [detalhesAberto, setDetalhesAberto] =
    useState(false)

  const [imagemAtual, setImagemAtual] =
    useState("")

  const [corSelecionada, setCorSelecionada] =
    useState<string | null>(null)

  const [indiceFoto, setIndiceFoto] =
    useState(0)

  // =========================
  // FOTOS DISPONÍVEIS
  // =========================
  //
  // AGORA AS FOTOS VÊM SOMENTE
  // DE fotos_produto.
  //
  // A coluna antiga "imagem" NÃO
  // é adicionada automaticamente.
  // =========================

  const fotos = variacoes
    .filter((foto) => foto.imagem)
    .filter(
      (foto, index, lista) =>
        lista.findIndex(
          (item) =>
            item.imagem === foto.imagem
        ) === index
    )

  // =========================
  // GARANTIR IMAGEM VÁLIDA
  // =========================

  useEffect(() => {
    if (fotos.length === 0) {
      setImagemAtual("")
      setIndiceFoto(0)
      return
    }

    const imagemAindaExiste =
      fotos.some(
        (foto) =>
          foto.imagem === imagemAtual
      )

    if (!imagemAindaExiste) {
      setImagemAtual(fotos[0].imagem)
      setIndiceFoto(0)
    }
  }, [fotos, imagemAtual])

  // =========================
  // TROCA AUTOMÁTICA
  // =========================

  useEffect(() => {
    if (detalhesAberto) {
      return
    }

    if (fotos.length <= 1) {
      return
    }

    if (corSelecionada) {
      return
    }

    const intervalo = setInterval(() => {
      setIndiceFoto((atual) => {
        const proximo =
          (atual + 1) % fotos.length

        setImagemAtual(
          fotos[proximo].imagem
        )

        return proximo
      })
    }, 3000)

    return () => {
      clearInterval(intervalo)
    }
  }, [
    fotos,
    corSelecionada,
    detalhesAberto,
  ])

  // =========================
  // CLICAR NA COR
  // =========================

  function selecionarCor(cor: string) {
    const fotoDaCor =
      variacoes.find(
        (variacao) =>
          variacao.nome
            .toLowerCase()
            .trim() ===
          cor.toLowerCase().trim()
      )

    setCorSelecionada(cor)

    if (fotoDaCor) {
      setImagemAtual(
        fotoDaCor.imagem
      )

      const indice =
        fotos.findIndex(
          (foto) =>
            foto.imagem ===
            fotoDaCor.imagem
        )

      if (indice !== -1) {
        setIndiceFoto(indice)
      }
    }
  }

  // =========================
  // ABRIR DETALHES
  // =========================

  function abrirDetalhes() {
    setDetalhesAberto(true)
  }

  // =========================
  // FECHAR DETALHES
  // =========================

  function fecharDetalhes() {
    setDetalhesAberto(false)
    setCorSelecionada(null)
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-lilas bg-white">

        {/* =========================
            FOTO DO PRODUTO
        ========================= */}

        <button
          onClick={abrirDetalhes}
          className="w-full text-left"
        >
          <div className="relative">

            <img
              src={
                imagemAtual ||
                imagem ||
                "/placeholder.svg"
              }
              alt={nome}
              className="
                h-52
                w-full
                object-cover
                md:h-64
                transition-opacity
                duration-300
              "
            />

            {/* INDICADORES */}

            {fotos.length > 1 && (
              <div
                className="
                  absolute
                  bottom-2
                  left-0
                  right-0
                  flex
                  justify-center
                  gap-1.5
                "
              >
                {fotos.map(
                  (foto, index) => (
                    <span
                      key={`${foto.imagem}-${index}`}
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${
                          indiceFoto === index
                            ? "bg-white"
                            : "bg-white/50"
                        }
                      `}
                    />
                  )
                )}
              </div>
            )}

          </div>

          {/* =========================
              NOME E PREÇO
          ========================= */}

          <div className="p-3">

            <h3 className="font-medium text-foreground">
              {nome}
            </h3>

            <p className="mt-1 font-bold text-roxo">
              R$ {preco.toFixed(2)}
            </p>

          </div>
        </button>

        {/* =========================
            CORES
        ========================= */}

        {cores.length > 0 && (
          <div className="px-3 pb-3">

            <p className="text-xs text-gray-500 mb-2">
              Cores:
            </p>

            <div className="flex flex-wrap gap-2">

              {cores.map((cor) => {
                const selecionada =
                  corSelecionada === cor

                const possuiFoto =
                  variacoes.some(
                    (variacao) =>
                      variacao.nome
                        .toLowerCase()
                        .trim() ===
                      cor.toLowerCase().trim()
                  )

                return (
                  <button
                    key={cor}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      selecionarCor(cor)
                    }}
                    className={`
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-xs
                      transition
                      ${
                        selecionada
                          ? "border-roxo bg-roxo text-white"
                          : possuiFoto
                            ? "border-lilas bg-white text-gray-700 hover:border-roxo"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                      }
                    `}
                  >
                    {cor}
                  </button>
                )
              })}

            </div>

          </div>
        )}

        {/* =========================
            COMPRAR
        ========================= */}

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

      {/* =========================
          DETALHES DO PRODUTO
      ========================= */}

      <ProdutoDetalhes
        aberto={detalhesAberto}
        fechar={fecharDetalhes}
        id={id}
        nome={nome}
        preco={preco}
        imagem={imagemAtual || imagem}
        tamanhos={tamanhos}
        cores={cores}
        variacoes={variacoes || []}
      />
    </>
  )
}