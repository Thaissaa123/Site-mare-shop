"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Slide = {
  id: number
  titulo: string
  texto: string
  imagem: string
  ordem: number
}

export default function GerenciarCarrossel() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [carregando, setCarregando] = useState(true)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [texto, setTexto] = useState("")
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null)

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")

  // EDIÇÃO
  const [editando, setEditando] = useState<Slide | null>(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)

  async function buscarSlides() {
    const { data, error } = await supabase
      .from("carrossel")
      .select("*")
      .order("ordem", { ascending: true })

    if (error) {
      console.error(error)
      setErro("Não foi possível carregar o carrossel.")
      setCarregando(false)
      return
    }

    setSlides(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    buscarSlides()
  }, [])

  // =========================
  // ADICIONAR SLIDE
  // =========================

  async function adicionarSlide() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setErro(
        "Você não está autenticada no Supabase. Faça login novamente."
      )
      return
    }

    setErro("")
    setMensagem("")

    if (!titulo || !arquivoImagem) {
      setErro("Preencha o título e escolha uma imagem.")
      return
    }

    setSalvando(true)

    const nomeArquivo =
      `${Date.now()}-${arquivoImagem.name.replace(/\s/g, "-")}`

    const { error: uploadError } = await supabase.storage
      .from("produtos")
      .upload(nomeArquivo, arquivoImagem)

    if (uploadError) {
      console.error(uploadError)
      setErro("Não foi possível enviar a imagem.")
      setSalvando(false)
      return
    }

    const { data: imagemData } = supabase.storage
      .from("produtos")
      .getPublicUrl(nomeArquivo)

    const urlImagem = imagemData.publicUrl

    const proximaOrdem =
      slides.length > 0
        ? Math.max(...slides.map((slide) => slide.ordem)) + 1
        : 0

    const { data, error } = await supabase
      .from("carrossel")
      .insert({
        titulo,
        texto,
        imagem: urlImagem,
        ordem: proximaOrdem,
      })
      .select()
      .single()

    if (error) {
      console.error("ERRO AO SALVAR SLIDE:", error)
      setErro(error.message)
      setSalvando(false)
      return
    }

    setSlides((atuais) => [...atuais, data])

    setTitulo("")
    setTexto("")
    setArquivoImagem(null)

    setMensagem("Slide adicionado com sucesso! 🎉")
    setSalvando(false)
  }

  // =========================
  // EDITAR SLIDE
  // =========================

  async function salvarEdicao() {
    if (!editando) return

    setErro("")
    setMensagem("")

    if (!editando.titulo.trim()) {
      setErro("Preencha o título.")
      return
    }

    setSalvandoEdicao(true)

    const { data, error } = await supabase
      .from("carrossel")
      .update({
        titulo: editando.titulo,
        texto: editando.texto,
      })
      .eq("id", editando.id)
      .select()
      .single()

    if (error) {
      console.error("ERRO AO EDITAR SLIDE:", error)
      setErro(error.message)
      setSalvandoEdicao(false)
      return
    }

    setSlides((atuais) =>
      atuais.map((slide) =>
        slide.id === data.id ? data : slide
      )
    )

    setEditando(null)
    setMensagem("Slide editado com sucesso! 🎉")
    setSalvandoEdicao(false)
  }

  // =========================
  // EXCLUIR SLIDE
  // =========================

  async function excluirSlide(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este slide?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("carrossel")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      setErro("Não foi possível excluir o slide.")
      return
    }

    setSlides((atuais) =>
      atuais.filter((slide) => slide.id !== id)
    )
  }

  // =========================
  // CARREGANDO
  // =========================

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <p className="text-center text-gray-500">
          Carregando carrossel...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">

        {/* VOLTAR */}
        <button
          onClick={() => {
            window.location.href = "/admin"
          }}
          className="text-gray-500 mb-4"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-bold text-roxo-escuro">
          Carrossel
        </h1>

        <p className="text-gray-500 mt-1 mb-6">
          Gerencie as imagens da página inicial.
        </p>

        {/* MENSAGENS */}
        {erro && (
          <p className="text-red-500 text-sm mb-4">
            {erro}
          </p>
        )}

        {mensagem && (
          <p className="text-green-600 text-sm mb-4">
            {mensagem}
          </p>
        )}

        {/* =========================
            FORMULÁRIO DE EDIÇÃO
        ========================= */}

        {editando ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <button
              onClick={() => {
                setEditando(null)
                setErro("")
              }}
              className="text-gray-500 mb-4"
            >
              ← Voltar
            </button>

            <h2 className="text-2xl font-bold text-roxo-escuro">
              Editar slide
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              Altere o título ou o texto do slide.
            </p>

            {/* IMAGEM ATUAL */}

            <img
              src={editando.imagem}
              alt={editando.titulo}
              className="w-full h-48 object-cover rounded-xl mb-5"
            />

            {/* TÍTULO */}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Título
              </label>

              <input
                type="text"
                value={editando.titulo}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    titulo: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            {/* TEXTO */}

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1">
                Texto
              </label>

              <textarea
                value={editando.texto || ""}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    texto: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 min-h-24"
              />
            </div>

            {/* SALVAR */}

            <button
              onClick={salvarEdicao}
              disabled={salvandoEdicao}
              className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {salvandoEdicao
                ? "Salvando..."
                : "💾 Salvar alterações"}
            </button>

          </div>
        ) : !mostrarFormulario ? (

          <>
            {/* ADICIONAR */}

            <button
              onClick={() => {
                setMostrarFormulario(true)
                setErro("")
                setMensagem("")
              }}
              className="w-full bg-roxo text-white rounded-xl py-3 font-semibold mb-6"
            >
              ➕ Adicionar slide
            </button>

            {/* LISTA */}

            {slides.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center">
                <p className="text-4xl mb-3">
                  🎠
                </p>

                <p className="text-gray-500">
                  Nenhum slide cadastrado.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                  >

                    <img
                      src={slide.imagem}
                      alt={slide.titulo}
                      className="w-full h-48 object-cover rounded-xl"
                    />

                    <h2 className="font-bold text-lg text-roxo-escuro mt-3">
                      {slide.titulo}
                    </h2>

                    {slide.texto && (
                      <p className="text-sm text-gray-500 mt-1">
                        {slide.texto}
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">

                      {/* EDITAR */}

                      <button
                        onClick={() => {
                          setEditando(slide)
                          setErro("")
                          setMensagem("")
                        }}
                        className="flex-1 border border-gray-200 rounded-xl py-2 font-medium"
                      >
                        ✏️ Editar
                      </button>

                      {/* EXCLUIR */}

                      <button
                        onClick={() =>
                          excluirSlide(slide.id)
                        }
                        className="flex-1 bg-red-50 text-red-600 rounded-xl py-2 font-medium"
                      >
                        🗑️ Excluir
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </>

        ) : (

          /* =========================
             FORMULÁRIO DE ADICIONAR
          ========================= */

          <div className="bg-white rounded-2xl p-6 shadow-sm">

            <button
              onClick={() => {
                setMostrarFormulario(false)
                setErro("")
                setMensagem("")
              }}
              className="text-gray-500 mb-4"
            >
              ← Voltar
            </button>

            <h2 className="text-2xl font-bold text-roxo-escuro">
              Novo slide
            </h2>

            <p className="text-gray-500 mt-1 mb-6">
              Adicione uma imagem para o carrossel.
            </p>

            <div className="space-y-4">

              {/* TÍTULO */}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Título
                </label>

                <input
                  type="text"
                  value={titulo}
                  onChange={(e) =>
                    setTitulo(e.target.value)
                  }
                  placeholder="Ex: Nova coleção"
                  className="w-full border rounded-xl px-4 py-3"
                />
              </div>

              {/* TEXTO */}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Texto
                </label>

                <textarea
                  value={texto}
                  onChange={(e) =>
                    setTexto(e.target.value)
                  }
                  placeholder="Ex: Confira as novidades da Maré Shop!"
                  className="w-full border rounded-xl px-4 py-3 min-h-24"
                />
              </div>

              {/* IMAGEM */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagem
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const arquivo =
                      e.target.files?.[0] || null

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

              {/* ERRO */}

              {erro && (
                <p className="text-red-500 text-sm">
                  {erro}
                </p>
              )}

              {/* MENSAGEM */}

              {mensagem && (
                <p className="text-green-600 text-sm">
                  {mensagem}
                </p>
              )}

              {/* SALVAR */}

              <button
                onClick={adicionarSlide}
                disabled={salvando}
                className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {salvando
                  ? "Salvando..."
                  : "💾 Salvar slide"}
              </button>

            </div>

          </div>
        )}

      </div>
    </main>
  )
}