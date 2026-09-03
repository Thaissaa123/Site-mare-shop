"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type Produto = {
  id: number
  nome: string
  preco: number
  categoria: string
  imagem: string
  tamanhos: string[]
  cores: string[]
}

export default function GerenciarProdutos() {
     const router = useRouter()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
 

  useEffect(() => {
    buscarProdutos()
  }, [])

  async function buscarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      console.error(error)
      setErro("Não foi possível carregar os produtos.")
      setCarregando(false)
      return
    }

    setProdutos(data || [])
    setCarregando(false)
  }

  async function excluirProduto(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      setErro("Não foi possível excluir o produto.")
      return
    }

    setProdutos((atuais) =>
      atuais.filter((produto) => produto.id !== id)
    )
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-500">
          Carregando produtos...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">

        <button
          onClick={() => {
            window.location.href = "/admin"
          }}
          className="text-gray-500 mb-4"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-bold text-roxo-escuro">
          Produtos
        </h1>

        <p className="text-gray-500 mt-1 mb-6">
          Gerencie os produtos da Maré Shop.
        </p>

        {erro && (
          <p className="text-red-500 text-sm mb-4">
            {erro}
          </p>
        )}

        {produtos.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">📦</p>

            <p className="text-gray-500">
              Nenhum produto cadastrado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >

                <div className="flex gap-4">

                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-24 h-24 object-cover rounded-xl"
                  />

                  <div className="flex-1">

                    <h2 className="font-bold text-lg text-roxo-escuro">
                      {produto.nome}
                    </h2>

                    <p className="text-gray-700">
                      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                    </p>

                    <p className="text-sm text-gray-500 capitalize">
                      {produto.categoria}
                    </p>

                  </div>

                </div>

                <div className="mt-4 flex gap-2">
<button
  onClick={() => router.push(`/admin/produtos/editar/${produto.id}`)}
  className="flex-1 border border-gray-200 rounded-xl py-2 font-medium"
>
  ✏️ Editar
</button>
                  <button
                    onClick={() => excluirProduto(produto.id)}
                    className="flex-1 bg-red-50 text-red-600 rounded-xl py-2 font-medium"
                  >
                    🗑️ Excluir
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}