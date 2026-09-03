"use client"

import Header from "@/components/header"
import Carrossel from "@/components/carrossel"
import ListaProdutos from "@/components/lista-produtos"
import { useCategoria } from "@/components/categoria-context"
import { useBusca } from "@/components/busca-context"

export default function Home() {
  const { categoria } = useCategoria()
  const { busca } = useBusca()

  return (
    <>
      <Header />

     <main>
        {categoria === "todas" && busca.trim() === "" && (
          <Carrossel />
        )}

        <ListaProdutos />
      </main>
    </>
  )
}