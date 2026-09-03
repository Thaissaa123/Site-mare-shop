"use client"

import { createContext, useContext, useState } from "react"

type CategoriaContextType = {
  categoria: string
  setCategoria: (categoria: string) => void
}

const CategoriaContext = createContext<CategoriaContextType | undefined>(
  undefined
)

export function CategoriaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [categoria, setCategoria] = useState("todas")

  return (
    <CategoriaContext.Provider value={{ categoria, setCategoria }}>
      {children}
    </CategoriaContext.Provider>
  )
}

export function useCategoria() {
  const contexto = useContext(CategoriaContext)

  if (!contexto) {
    throw new Error(
      "useCategoria precisa estar dentro de CategoriaProvider"
    )
  }

  return contexto
}