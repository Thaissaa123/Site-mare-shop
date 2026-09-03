"use client"

import { useCarrinho } from "@/components/carrinho-context"

// Número da sua mãe no formato do WhatsApp
const WHATSAPP = "5513974135426"

type CarrinhoProps = {
  aberto: boolean
  aoFechar: () => void
}

export default function Carrinho({
  aberto,
  aoFechar,
}: CarrinhoProps) {
  const {
    itens,
    remover,
    alterarQuantidade,
    limpar,
    total,
  } = useCarrinho()

function enviarPedido() {
  let mensagem =
    "Olá! Gostaria de fazer o seguinte pedido:\n\n"

  itens.forEach((item, index) => {
    const subtotal = item.preco * item.quantidade

    mensagem +=
      `${index + 1}. ${item.nome}\n` +
      `Tamanho: ${item.tamanho}\n` +
      `Cor: ${item.cor}\n` +
      `Quantidade: ${item.quantidade}\n` +
      `Valor: R$ ${subtotal.toFixed(2)}\n\n`
  })

  mensagem += `Total: R$ ${total.toFixed(2)}`

  const link = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensagem)

  window.open(link, "_blank")
}
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50">

      {/* Fundo escuro */}
      <button
        aria-label="Fechar carrinho"
        onClick={aoFechar}
        className="absolute inset-0 bg-black/50"
      />

      {/* Painel */}
      <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white flex flex-col">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between bg-roxo text-white px-4 py-3">

          <h2 className="text-lg font-bold">
            Seu carrinho
          </h2>

          <button
            aria-label="Fechar"
            onClick={aoFechar}
            className="text-2xl"
          >
            ×
          </button>

        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4">

          {itens.length === 0 ? (

            <p className="text-center text-foreground/60 mt-8">
              Seu carrinho está vazio.
            </p>

          ) : (

            itens.map((item) => (

              <div
                key={`${item.id}-${item.tamanho}-${item.cor}`}
                className="border-b border-lilas py-4"
              >

                <div className="flex gap-3">

                  {/* Foto */}
                  <img
                    src={item.imagem || "/placeholder.svg"}
                    alt={item.nome}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  {/* Informações */}
                  <div className="flex-1">

                    <p className="font-semibold text-gray-800">
                      {item.nome}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      R$ {item.preco.toFixed(2)} cada
                    </p>

                    {/* Tamanho */}
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">
                        Tamanho:
                      </span>{" "}
                      {item.tamanho}
                    </p>

                    {/* Cor */}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        Cor:
                      </span>{" "}
                      {item.cor}
                    </p>

                  </div>

                  {/* Total do produto */}
                  <div className="text-right">

                    <p className="font-bold text-roxo">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </p>

                    <button
                      onClick={() =>
                        remover(
                          item.id,
                          item.tamanho,
                          item.cor
                        )
                      }
                      className="text-xs text-gray-500 mt-2"
                    >
                      Remover
                    </button>

                  </div>

                </div>

                {/* Quantidade */}
                <div className="flex items-center gap-2 mt-3">

                  <button
                    type="button"
                    onClick={() => {

                      if (item.quantidade === 1) {

                        remover(
                          item.id,
                          item.tamanho,
                          item.cor
                        )

                      } else {

                        alterarQuantidade(
                          item.id,
                          item.tamanho,
                          item.cor,
                          item.quantidade - 1
                        )

                      }

                    }}
                    className="w-8 h-8 rounded-full bg-lilas text-roxo font-bold text-lg flex items-center justify-center"
                  >
                    −
                  </button>

                  {/* Número */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    <span className="text-black font-bold">
                      {item.quantidade}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      alterarQuantidade(
                        item.id,
                        item.tamanho,
                        item.cor,
                        item.quantidade + 1
                      )
                    }
                    className="w-8 h-8 rounded-full bg-roxo text-white font-bold text-lg flex items-center justify-center"
                  >
                    +
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

        {/* Rodapé */}
        {itens.length > 0 && (

          <div className="border-t border-lilas p-4">

            <div className="flex justify-between mb-3">

              <span className="font-medium">
                Total:
              </span>

              <span className="font-bold text-roxo">
                R$ {total.toFixed(2)}
              </span>

            </div>
{itens.length > 0 && (
  <div className="border-t border-lilas p-4">

    <div className="flex justify-between mb-3">
      <span className="font-medium">
        Total:
      </span>

      <span className="font-bold text-roxo">
        R$ {total.toFixed(2)}
      </span>
    </div>

    {/* Continuar comprando */}
    <button
      onClick={aoFechar}
      className="w-full rounded-full border-2 border-roxo text-roxo py-3 font-medium mb-2"
    >
      Continuar comprando
    </button>

    {/* Limpar carrinho */}
    <button
      onClick={() => {
        if (confirm("Tem certeza que deseja limpar o carrinho?")) {
          limpar()
        }
      }}
      className="w-full text-sm text-gray-500 py-2 mb-2"
    >
      Limpar carrinho
    </button>

    {/* WhatsApp */}
    <button
      onClick={enviarPedido}
      className="w-full rounded-full bg-roxo text-white py-3 font-medium"
    >
      Enviar pedido pelo WhatsApp
    </button>

  </div>
)}
          </div>

        )}

      </div>

    </div>
  )
}