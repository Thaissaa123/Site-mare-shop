"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function EditarProduto() {
  const params = useParams()
  const id = params.id

  const [nome, setNome] = useState("")
  const [preco, setPreco] = useState("")
  const [categoria, setCategoria] = useState("vestidos")
  const [imagemAtual, setImagemAtual] = useState("")

  const [tamanhos, setTamanhos] = useState<string[]>([])
  const [cores, setCores] = useState<string[]>([])

  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null)

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    buscarProduto()
  }, [id])

  async function buscarProduto() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
      setErro("Não foi possível carregar o produto.")
      setCarregando(false)
      return
    }

    setNome(data.nome)
    setPreco(String(data.preco))
    setCategoria(data.categoria)
    setImagemAtual(data.imagem)
    setTamanhos(data.tamanhos || [])
    setCores(data.cores || [])

    setCarregando(false)
  }

  function selecionarTamanho(tamanho: string) {
    setTamanhos((atuais) =>
      atuais.includes(tamanho)
        ? atuais.filter((item) => item !== tamanho)
        : [...atuais, tamanho]
    )
  }

  function selecionarCor(cor: string) {
    setCores((atuais) =>
      atuais.includes(cor)
        ? atuais.filter((item) => item !== cor)
        : [...atuais, cor]
    )
  }

  async function salvarAlteracoes() {
    setErro("")
    setMensagem("")

    if (!nome || !preco || !categoria) {
      setErro("Preencha todos os campos.")
      return
    }

    if (tamanhos.length === 0) {
      setErro("Escolha pelo menos um tamanho.")
      return
    }

    if (cores.length === 0) {
      setErro("Escolha pelo menos uma cor.")
      return
    }

    setSalvando(true)

    let urlImagem = imagemAtual

    // Se escolheu uma nova foto, envia para o Storage
    if (arquivoImagem) {
      const nomeArquivo =
        `${Date.now()}-${arquivoImagem.name.replace(/\s/g, "-")}`

      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(nomeArquivo, arquivoImagem)

      if (uploadError) {
        console.error(uploadError)
        setErro("Não foi possível enviar a nova imagem.")
        setSalvando(false)
        return
      }

      const { data: imagemData } = supabase.storage
        .from("produtos")
        .getPublicUrl(nomeArquivo)

      urlImagem = imagemData.publicUrl
    }

    const { error } = await supabase
      .from("produtos")
      .update({
        nome,
        preco: Number(preco),
        categoria,
        imagem: urlImagem,
        tamanhos,
        cores,
      })
      .eq("id", id)

    setSalvando(false)

    if (error) {
      console.error(error)
      setErro("Não foi possível salvar as alterações.")
      return
    }

    setImagemAtual(urlImagem)
    setArquivoImagem(null)
    setMensagem("Produto atualizado com sucesso! 🎉")
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-500">
          Carregando produto...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">

        <button
          onClick={() => {
            window.location.href = "/admin/produtos"
          }}
          className="text-gray-500 mb-4"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm">

          <h1 className="text-2xl font-bold text-roxo-escuro">
            Editar produto
          </h1>

          <p className="text-gray-500 mt-1 mb-6">
            Altere as informações do produto.
          </p>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Nome
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preço
              </label>

              <input
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria
              </label>

              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 bg-white"
              >
                <option value="vestidos">Vestidos</option>
                <option value="blusas">Blusas</option>
                <option value="saias">Saias</option>
                <option value="acessorios">Acessórios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Foto atual
              </label>

              <img
                src={imagemAtual}
                alt={nome}
                className="w-full h-56 object-cover rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Trocar foto
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0] || null
                  setArquivoImagem(arquivo)
                }}
                className="w-full border rounded-xl px-4 py-3"
              />

              {arquivoImagem && (
                <p className="text-sm text-gray-500 mt-2">
                  📷 {arquivoImagem.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tamanhos
              </label>

              <div className="flex gap-2 flex-wrap">
                {["P", "M", "G", "GG", "Único"].map((tamanho) => (
                  <button
                    key={tamanho}
                    type="button"
                    onClick={() => selecionarTamanho(tamanho)}
                    className={`px-4 py-2 rounded-full border ${
                      tamanhos.includes(tamanho)
                        ? "bg-roxo text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cores
              </label>

              <div className="flex gap-2 flex-wrap">
                {[
                  "Preto",
                  "Branco",
                  "Rosa",
                  "Bege",
                  "Marrom",
                  "Vermelho",
                  "Azul",
                  "Verde",
                  "Dourado",
                ].map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => selecionarCor(cor)}
                    className={`px-4 py-2 rounded-full border ${
                      cores.includes(cor)
                        ? "bg-roxo text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {cor}
                  </button>
                ))}
              </div>
            </div>

            {erro && (
              <p className="text-red-500 text-sm">
                {erro}
              </p>
            )}

            {mensagem && (
              <p className="text-green-600 text-sm">
                {mensagem}
              </p>
            )}

            <button
              onClick={salvarAlteracoes}
              disabled={salvando}
              className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "💾 Salvar alterações"}
            </button>

          </div>

        </div>

      </div>
    </main>
  )
}