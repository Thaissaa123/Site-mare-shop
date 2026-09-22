"use client"

import { createContext, useContext, useState } from "react"

type CategoriaContextType = {
  categoria: string
  subcategoria: string | null

  setCategoria: (categoria: string) => void
  setSubcategoria: (subcategoria: string | null) => void

  limparCategoria: () => void
  voltarParaCategoria: () => void
}

const CategoriaContext = createContext<
  CategoriaContextType | undefined
>(undefined)

export function CategoriaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [categoria, setCategoriaEstado] = useState("todas")
  const [subcategoria, setSubcategoriaEstado] = useState<string | null>(
    null
  )

  function setCategoria(categoria: string) {
    setCategoriaEstado(categoria)
    setSubcategoriaEstado(null)
  }

  function setSubcategoria(subcategoria: string | null) {
    setSubcategoriaEstado(subcategoria)
  }

  function limparCategoria() {
    setCategoriaEstado("todas")
    setSubcategoriaEstado(null)
  }

  function voltarParaCategoria() {
    setSubcategoriaEstado(null)
  }

  return (
    <CategoriaContext.Provider
      value={{
        categoria,
        subcategoria,
        setCategoria,
        setSubcategoria,
        limparCategoria,
        voltarParaCategoria,
      }}
    >
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