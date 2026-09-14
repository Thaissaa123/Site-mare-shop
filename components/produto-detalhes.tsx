"use client"

import { useEffect, useState } from "react"
import { useCarrinho } from "@/components/carrinho-context"

type Variacao = {
  nome: string
  imagem: string
}

type ProdutoDetalhesProps = {
  aberto: boolean
  fechar: () => void
  id: number
  nome: string
  preco: number
  imagem: string
  tamanhos: string[]
  cores: string[]
  variacoes: Variacao[]
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
  variacoes,
}: ProdutoDetalhesProps) {
  const [tamanho, setTamanho] = useState("")
  const [cor, setCor] = useState("")
  const [quantidade, setQuantidade] = useState(1)
  const [adicionado, setAdicionado] = useState(false)

  const [imagemAtual, setImagemAtual] = useState(imagem)
  const [imagemAmpliada, setImagemAmpliada] = useState(false)

  const { adicionar } = useCarrinho()

  // =========================
  // ABRIR / TROCAR PRODUTO
  // =========================
  //
  // IMPORTANTE:
  // Não colocamos "imagem" nas dependências.
  //
  // A imagem pode mudar por causa do carrossel,
  // mas isso NÃO deve apagar tamanho e cor.
  // =========================

  useEffect(() => {
    if (!aberto) {
      return
    }

    setImagemAtual(imagem)
    setCor("")
    setTamanho("")
    setQuantidade(1)
    setAdicionado(false)
    setImagemAmpliada(false)
  }, [id, aberto])

  // =========================
  // ATUALIZAR IMAGEM
  // =========================
  //
  // Quando a imagem muda enquanto o modal está
  // aberto, NÃO resetamos tamanho nem cor.
  // =========================

  useEffect(() => {
    if (!aberto) {
      return
    }

    // Se já existe uma cor selecionada,
    // não deixamos a imagem recebida do card
    // sobrescrever a foto escolhida.
    if (cor) {
      return
    }

    setImagemAtual(imagem)
  }, [imagem, aberto, cor])

  // =========================
  // ESCOLHER COR
  // =========================

  function escolherCor(corEscolhida: string) {
    setCor(corEscolhida)

    const variacaoEncontrada = variacoes.find(
      (variacao) =>
        variacao.nome.toLowerCase().trim() ===
        corEscolhida.toLowerCase().trim()
    )

    console.log("COR ESCOLHIDA:", corEscolhida)
    console.log("FOTOS:", variacoes)
    console.log(
      "FOTO ENCONTRADA:",
      variacaoEncontrada
    )

    if (variacaoEncontrada?.imagem) {
      setImagemAtual(
        variacaoEncontrada.imagem
      )
    }
  }

  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function adicionarAoCarrinho() {
    if (!tamanho || !cor) {
      alert(
        "Escolha o tamanho e a cor antes de adicionar ao carrinho."
      )
      return
    }

    adicionar({
      id,
      nome,
      preco,
      imagem: imagemAtual,
      tamanho,
      cor,
      quantidade,
    })

    setAdicionado(true)

    setTimeout(() => {
      setAdicionado(false)
      fechar()
    }, 1000)
  }

  if (!aberto) return null

  return (
    <>
      {/* =========================
          MODAL DO PRODUTO
      ========================= */}

      <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">

        <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">

          {/* =========================
              FOTO
          ========================= */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setImagemAmpliada(true)
              }
              className="w-full"
              aria-label="Ampliar foto do produto"
            >

              <img
                src={
                  imagemAtual ||
                  "/placeholder.svg"
                }
                alt={nome}
                className="w-full h-80 object-cover"
              />

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
                🔍 Toque para ampliar
              </div>

            </button>

            {/* FECHAR */}

            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar detalhes do produto"
              className="
                absolute
                top-3
                right-3
                w-10
                h-10
                rounded-full
                bg-white/90
                text-gray-700
                text-2xl
                flex
                items-center
                justify-center
                shadow-md
              "
            >
              ×
            </button>

          </div>

          <div className="p-5">

            {/* =========================
                NOME
            ========================= */}

            <h2 className="text-2xl font-bold text-foreground">
              {nome}
            </h2>

            {/* =========================
                PREÇO
            ========================= */}

            <p className="text-xl font-bold text-roxo mt-2">
              R$ {preco.toFixed(2)}
            </p>

            {/* =========================
                TAMANHOS
            ========================= */}

            <div className="mt-6">

              <h3 className="font-semibold mb-3">
                Escolha o tamanho
              </h3>

              <div className="flex flex-wrap gap-2">

                {tamanhos.map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    onClick={() =>
                      setTamanho(opcao)
                    }
                    className={`
                      px-5
                      py-2
                      rounded-full
                      border
                      ${
                        tamanho === opcao
                          ? "bg-roxo text-white border-roxo"
                          : "border-lilas text-foreground"
                      }
                    `}
                  >
                    {opcao}
                  </button>
                ))}

              </div>

            </div>

            {/* =========================
                CORES / FOTOS
            ========================= */}

            <div className="mt-6">

              <h3 className="font-semibold mb-3">
                Escolha a cor
              </h3>

              <div className="flex flex-wrap gap-3">

                {cores.map((opcao) => {

                  const fotoDaCor =
                    variacoes.find(
                      (item) =>
                        item.nome
                          .toLowerCase()
                          .trim() ===
                        opcao
                          .toLowerCase()
                          .trim()
                    )

                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() =>
                        escolherCor(opcao)
                      }
                      className={`
                        overflow-hidden
                        rounded-xl
                        border-2
                        ${
                          cor === opcao
                            ? "border-roxo"
                            : "border-lilas"
                        }
                        bg-white
                      `}
                    >

                      {/* FOTO DA COR */}

                      <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">

                        {fotoDaCor?.imagem ? (
                          <img
                            src={
                              fotoDaCor.imagem
                            }
                            alt={opcao}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            Sem foto
                          </span>
                        )}

                      </div>

                      {/* NOME DA COR */}

                      <div className="px-2 py-2 text-sm text-center">
                        {opcao}
                      </div>

                    </button>
                  )
                })}

              </div>

              {/* AVISO */}

              {cores.some(
                (cor) =>
                  !variacoes.some(
                    (variacao) =>
                      variacao.nome
                        .toLowerCase()
                        .trim() ===
                        cor
                          .toLowerCase()
                          .trim() &&
                      !!variacao.imagem
                  )
              ) && (
                <p className="text-xs text-red-500 mt-3">
                  ⚠ Algumas cores ainda não possuem
                  foto cadastrada.
                </p>
              )}

            </div>

            {/* =========================
                QUANTIDADE
            ========================= */}

            <div className="mt-6">

              <h3 className="font-semibold mb-3 text-gray-800">
                Quantidade
              </h3>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setQuantidade(
                      (q) => Math.max(1, q - 1)
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-lilas
                    text-roxo
                    text-xl
                    font-bold
                    flex
                    items-center
                    justify-center
                  "
                >
                  −
                </button>

                <div
                  className="
                    w-12
                    h-10
                    border-2
                    border-roxo
                    rounded-lg
                    bg-white
                    flex
                    items-center
                    justify-center
                  "
                >
                  <span className="text-black font-bold text-lg">
                    {quantidade}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setQuantidade(
                      (q) => q + 1
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-roxo
                    text-white
                    text-xl
                    font-bold
                    flex
                    items-center
                    justify-center
                  "
                >
                  +
                </button>

              </div>

            </div>

            {/* =========================
                ADICIONAR AO CARRINHO
            ========================= */}

            <button
              type="button"
              onClick={adicionarAoCarrinho}
              className="
                w-full
                mt-8
                rounded-full
                bg-roxo
                text-white
                py-3
                font-semibold
              "
            >
              {adicionado
                ? "✓ Produto adicionado!"
                : "Adicionar ao carrinho"}
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          FOTO AMPLIADA
      ========================= */}

      {imagemAmpliada && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/90
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            setImagemAmpliada(false)
          }
        >

          <img
            src={
              imagemAtual ||
              "/placeholder.svg"
            }
            alt={nome}
            className="
              max-h-[90vh]
              max-w-full
              object-contain
              rounded-lg
            "
          />

          <button
            type="button"
            onClick={() =>
              setImagemAmpliada(false)
            }
            className="
              absolute
              top-4
              right-4
              w-10
              h-10
              rounded-full
              bg-white
              text-gray-800
              text-2xl
              shadow-lg
            "
            aria-label="Fechar foto ampliada"
          >
            ×
          </button>

        </div>
      )}
    </>
  )
}

