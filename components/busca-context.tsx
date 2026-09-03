"use client"

import { createContext, useContext, useState } from "react"

type BuscaContextType = {
  busca: string
  setBusca: (busca: string) => void
}

const BuscaContext = createContext<BuscaContextType | undefined>(undefined)

export function BuscaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [busca, setBusca] = useState("")

  return (
    <BuscaContext.Provider value={{ busca, setBusca }}>
      {children}
    </BuscaContext.Provider>
  )
}

export function useBusca() {
  const contexto = useContext(BuscaContext)

  if (!contexto) {
    throw new Error(
      "useBusca precisa estar dentro de BuscaProvider"
    )
  }

  return contexto
}