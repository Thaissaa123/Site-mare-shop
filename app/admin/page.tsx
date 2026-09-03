"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Admin() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [entrou, setEntrou] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nome, setNome] = useState("")
  const [preco, setPreco] = useState("")
  const [categoria, setCategoria] = useState("vestidos")
  const [imagem, setImagem] = useState("")
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null)
  const [tamanhos, setTamanhos] = useState<string[]>([])
  const [cores, setCores] = useState<string[]>([])

  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")

  async function entrar() {
    setErro("")
    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    setCarregando(false)

    if (error) {
      setErro("E-mail ou senha incorretos.")
      return
    }

    setEntrou(true)
  }

  async function sair() {
    await supabase.auth.signOut()

    setEntrou(false)
    setEmail("")
    setSenha("")
    setMostrarFormulario(false)
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

  async function salvarProduto() {
    setMensagem("")
    setErro("")

    if (!nome || !preco || !categoria || !arquivoImagem) {
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
    setSalvando(true)

    const { error } = await supabase
      .from("produtos")
      .insert({
        nome,
        preco: Number(preco),
        categoria,
        imagem: urlImagem,
        tamanhos,
        cores,
      })

    setSalvando(false)

    if (error) {
      console.error(error)
      setErro("Não foi possível salvar o produto.")
      return
    }

    setMensagem("Produto cadastrado com sucesso! 🎉")

    setNome("")
    setPreco("")
    setCategoria("vestidos")
    setImagem("")
setArquivoImagem(null)
    setTamanhos([])
    setCores([])
  }

  if (entrou) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto">

          {!mostrarFormulario ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm">

              <h1 className="text-3xl font-bold text-roxo-escuro">
                Painel Administrativo
              </h1>

              <p className="mt-2 text-gray-600">
                Bem-vinda ao painel da Maré Shop! 💜
              </p>

              <div className="mt-6 grid gap-3">

                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="w-full rounded-xl bg-roxo text-white py-3 font-semibold"
                >
                  ➕ Adicionar produto
                </button>

               <button
  onClick={() => {
    window.location.href = "/admin/produtos"
  }}
  className="w-full rounded-xl border border-gray-200 py-3 font-semibold"
>
  📦 Gerenciar produtos
</button>

                <button
  onClick={() => {
    window.location.href = "/admin/carrossel"
  }}
  className="w-full rounded-xl border border-gray-200 py-3 font-semibold"
>
  🎠 Editar carrossel
</button>

              </div>

              <button
                onClick={sair}
                className="w-full mt-6 text-red-500 py-2"
              >
                Sair
              </button>

            </div>
          ) : (

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

              <h1 className="text-2xl font-bold text-roxo-escuro">
                Novo produto
              </h1>

              <p className="text-gray-500 mt-1 mb-6">
                Cadastre um produto na loja.
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
                    placeholder="Ex: Vestido Floral"
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
                    placeholder="89.90"
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
  <option value="blusas">Blusas</option>
  <option value="calcas">Calças</option>
  <option value="shorts-e-saias">Shorts e Saias</option>
  <option value="vestidos">Vestidos</option>
  <option value="conjuntos">Conjuntos</option>
  <option value="acessorios">Acessórios</option>
  <option value="colecao-inverno">Coleção Inverno</option>
</select>
                </div>

                <div>
  <label className="block text-sm font-medium mb-2">
    Foto do produto
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
                  onClick={salvarProduto}
                  disabled={salvando}
                  className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar produto"}
                </button>

              </div>

            </div>

          )}

        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-sm p-7">

          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold text-roxo-escuro">
              Maré Shop
            </h1>

            <p className="text-gray-500 mt-2">
              Área administrativa 🔐
            </p>
          </div>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            {erro && (
              <p className="text-red-500 text-sm text-center">
                {erro}
              </p>
            )}

            <button
              onClick={entrar}
              disabled={carregando}
              className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

          </div>

        </div>

      </div>

    </main>
  )
}