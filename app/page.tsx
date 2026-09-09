"use client"

import Header from "@/components/header"
import Carrossel from "@/components/carrossel"
import CategoriasFotos from "@/components/categoriasfotos"
import ListaProdutos from "@/components/lista-produtos"
import { useCategoria } from "@/components/categoria-context"
import { useBusca } from "@/components/busca-context"

export default function Home() {
  const { categoria } = useCategoria()
  const { busca } = useBusca()

  const mostrarInicio =
    categoria === "todas" && busca.trim() === ""

  return (
    <>
      <Header />

      <main>

        {mostrarInicio && (
          <>
            <Carrossel />

            <CategoriasFotos />

            {/* Pagamento e entrega */}
            <section className="mx-0 mt-2 rounded-lg bg-lilas/30 px-5 py-6 text-center md:mx-8 md:mt-4 md:rounded-xl md:py-7">
              <h2 className="text-lg font-bold text-roxo md:text-2xl">
                💜 Pagamento e entrega
              </h2>

              <p className="mt-2 text-sm text-gray-600 md:text-base">
                Após finalizar seu pedido, você será direcionado para o
                WhatsApp para combinar a forma de pagamento e a entrega.
              </p>
            </section>
          </>
        )}

        <ListaProdutos />

      </main>
    </>
  )
}