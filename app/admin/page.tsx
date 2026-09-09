"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Variacao = {
  nome: string
  arquivo: File | null
}

export default function Admin() {
  // =========================
  // LOGIN
  // =========================

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [entrou, setEntrou] = useState(false)

  // =========================
  // FORMULÁRIO
  // =========================

  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nome, setNome] = useState("")
  const [preco, setPreco] = useState("")
  const [categoria, setCategoria] = useState("vestidos")

  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null)

  const [tamanhos, setTamanhos] = useState<string[]>([])
  const [cores, setCores] = useState<string[]>([])

  const [variacoes, setVariacoes] = useState<Variacao[]>([])

  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")

  // =========================
  // VERIFICAR SESSÃO
  // =========================

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setEntrou(true)
      }
    }

    verificarSessao()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEntrou(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // =========================
  // LOGIN
  // =========================

  async function entrar() {
    setErro("")
    setMensagem("")

    if (!email || !senha) {
      setErro("Digite seu e-mail e sua senha.")
      return
    }

    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    setCarregando(false)

    if (error) {
      console.error(error)
      setErro("E-mail ou senha incorretos.")
      return
    }

    setEntrou(true)
  }

  // =========================
  // SAIR
  // =========================

  async function sair() {
    await supabase.auth.signOut()

    setEntrou(false)
    setEmail("")
    setSenha("")
    setMostrarFormulario(false)
    setErro("")
    setMensagem("")
  }

  // =========================
  // TAMANHOS
  // =========================

  function selecionarTamanho(tamanho: string) {
    setTamanhos((atuais) =>
      atuais.includes(tamanho)
        ? atuais.filter((item) => item !== tamanho)
        : [...atuais, tamanho]
    )
  }

  // =========================
  // CORES / ESTAMPAS
  // =========================

  function adicionarCor() {
    const input = document.getElementById(
      "nova-cor"
    ) as HTMLInputElement | null

    if (!input) return

    const novaCor = input.value.trim()

    if (!novaCor) return

    if (cores.includes(novaCor)) {
      setErro("Essa cor ou estampa já foi adicionada.")
      return
    }

    setCores((atuais) => [...atuais, novaCor])

    input.value = ""
    setErro("")
  }

  function removerCor(cor: string) {
    setCores((atuais) =>
      atuais.filter((item) => item !== cor)
    )
  }

  // =========================
  // VARIAÇÕES / ESTAMPAS
  // =========================

  function adicionarVariacao() {
    setVariacoes((atuais) => [
      ...atuais,
      {
        nome: "",
        arquivo: null,
      },
    ])
  }

  function removerVariacao(index: number) {
    setVariacoes((atuais) =>
      atuais.filter((_, i) => i !== index)
    )
  }

  function alterarNomeVariacao(
    index: number,
    nomeVariacao: string
  ) {
    setVariacoes((atuais) =>
      atuais.map((variacao, i) =>
        i === index
          ? {
              ...variacao,
              nome: nomeVariacao,
            }
          : variacao
      )
    )
  }

  function alterarArquivoVariacao(
    index: number,
    arquivo: File | null
  ) {
    setVariacoes((atuais) =>
      atuais.map((variacao, i) =>
        i === index
          ? {
              ...variacao,
              arquivo,
            }
          : variacao
      )
    )
  }

  // =========================
  // SALVAR PRODUTO
  // =========================

  async function salvarProduto() {
    setMensagem("")
    setErro("")

    if (!nome.trim() || !preco || !categoria || !arquivoImagem) {
      setErro("Preencha todos os campos obrigatórios.")
      return
    }

    if (tamanhos.length === 0) {
      setErro("Escolha pelo menos um tamanho.")
      return
    }

    if (cores.length === 0) {
      setErro("Adicione pelo menos uma cor ou estampa.")
      return
    }

    // Verifica se existe alguma variação incompleta
    const variacaoIncompleta = variacoes.some(
      (variacao) =>
        !variacao.nome.trim() || !variacao.arquivo
    )

    if (variacaoIncompleta) {
      setErro(
        "Preencha o nome e a foto de todas as estampas adicionadas."
      )
      return
    }

    setSalvando(true)

    try {
      // =========================
      // FOTO PRINCIPAL
      // =========================

      const nomeArquivoPrincipal =
        `${Date.now()}-${arquivoImagem.name.replace(/\s/g, "-")}`

      const { error: uploadError } =
        await supabase.storage
          .from("produtos")
          .upload(
            nomeArquivoPrincipal,
            arquivoImagem
          )

      if (uploadError) {
        console.error(uploadError)
        setErro(
          "Não foi possível enviar a foto principal."
        )
        setSalvando(false)
        return
      }

      const { data: imagemData } =
        supabase.storage
          .from("produtos")
          .getPublicUrl(nomeArquivoPrincipal)

      const urlImagem = imagemData.publicUrl

      // =========================
      // FOTOS DAS VARIAÇÕES
      // =========================

      const variacoesSalvas: {
        nome: string
        imagem: string
      }[] = []

      for (const variacao of variacoes) {
        if (!variacao.arquivo) {
          continue
        }

        const nomeArquivoVariacao =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}-${variacao.arquivo.name.replace(
            /\s/g,
            "-"
          )}`

        const { error: erroUploadVariacao } =
          await supabase.storage
            .from("produtos")
            .upload(
              nomeArquivoVariacao,
              variacao.arquivo
            )

        if (erroUploadVariacao) {
          console.error(erroUploadVariacao)
          setErro(
            "Não foi possível enviar uma das fotos das estampas."
          )
          setSalvando(false)
          return
        }

        const { data: dadosImagemVariacao } =
          supabase.storage
            .from("produtos")
            .getPublicUrl(nomeArquivoVariacao)

        variacoesSalvas.push({
          nome: variacao.nome.trim(),
          imagem: dadosImagemVariacao.publicUrl,
        })
      }

      // =========================
      // SALVAR NO SUPABASE
      // =========================

      const { error } = await supabase
        .from("produtos")
        .insert({
          nome: nome.trim(),
          preco: Number(preco),
          categoria,
          imagem: urlImagem,
          tamanhos,
          cores,
          variacoes: variacoesSalvas,
        })

      if (error) {
        console.error(error)
        setErro(
          "Não foi possível salvar o produto."
        )
        setSalvando(false)
        return
      }

      // =========================
      // LIMPAR FORMULÁRIO
      // =========================

      setNome("")
      setPreco("")
      setCategoria("vestidos")
      setArquivoImagem(null)
      setTamanhos([])
      setCores([])
      setVariacoes([])

      // Limpa o input de arquivo
      const inputArquivo =
        document.getElementById(
          "foto-produto"
        ) as HTMLInputElement | null

      if (inputArquivo) {
        inputArquivo.value = ""
      }

      setMensagem(
        "Produto cadastrado com sucesso! 🎉"
      )
    } catch (error) {
      console.error(error)
      setErro(
        "Ocorreu um erro ao cadastrar o produto."
      )
    }

    setSalvando(false)
  }

  // =========================
  // PAINEL ADMINISTRATIVO
  // =========================

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
                  onClick={() => {
                    setMostrarFormulario(true)
                    setErro("")
                    setMensagem("")
                  }}
                  className="w-full rounded-xl bg-roxo text-white py-3 font-semibold"
                >
                  ➕ Adicionar produto
                </button>

                <button
                  onClick={() => {
                    window.location.href =
                      "/admin/produtos"
                  }}
                  className="w-full rounded-xl border border-gray-200 py-3 font-semibold"
                >
                  📦 Gerenciar produtos
                </button>

                <button
                  onClick={() => {
                    window.location.href =
                      "/admin/carrossel"
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

            // =========================
            // NOVO PRODUTO
            // =========================

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

              <div className="space-y-5">

                {/* NOME */}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nome
                  </label>

                  <input
                    type="text"
                    value={nome}
                    onChange={(e) =>
                      setNome(e.target.value)
                    }
                    placeholder="Ex: Vestido Floral"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                {/* PREÇO */}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preço
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={preco}
                    onChange={(e) =>
                      setPreco(e.target.value)
                    }
                    placeholder="89.90"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                {/* CATEGORIA */}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoria
                  </label>

                  <select
                    value={categoria}
                    onChange={(e) =>
                      setCategoria(e.target.value)
                    }
                    className="w-full border rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="blusas">
                      Blusas
                    </option>

                    <option value="calcas">
                      Calças
                    </option>

                    <option value="shorts-e-saias">
                      Shorts e Saias
                    </option>

                    <option value="vestidos">
                      Vestidos
                    </option>

                    <option value="conjuntos">
                      Conjuntos
                    </option>

                    <option value="acessorios">
                      Acessórios
                    </option>

                    <option value="colecao-inverno">
                      Coleção Inverno
                    </option>
                  </select>
                </div>

                {/* FOTO PRINCIPAL */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Foto principal do produto
                  </label>

                  <input
                    id="foto-produto"
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

                {/* TAMANHOS */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tamanhos
                  </label>

                  <div className="flex gap-2 flex-wrap">
                    {[
                      "P",
                      "M",
                      "G",
                      "GG",
                      "G1",
                      "Único",
                    ].map((tamanho) => (
                      <button
                        key={tamanho}
                        type="button"
                        onClick={() =>
                          selecionarTamanho(
                            tamanho
                          )
                        }
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

                {/* CORES */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cores / Estampas
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="nova-cor"
                      type="text"
                      placeholder="Ex: Floral rosa"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          adicionarCor()
                        }
                      }}
                      className="flex-1 border rounded-xl px-4 py-3"
                    />

                    <button
                      type="button"
                      onClick={adicionarCor}
                      className="bg-roxo text-white px-5 rounded-xl font-semibold"
                    >
                      +
                    </button>
                  </div>

                  {cores.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {cores.map((cor) => (
                        <button
                          key={cor}
                          type="button"
                          onClick={() =>
                            removerCor(cor)
                          }
                          className="px-4 py-2 rounded-full bg-roxo text-white text-sm"
                        >
                          {cor} ×
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Digite cada cor ou estampa e clique
                    em +.
                  </p>
                </div>

                {/* VARIAÇÕES */}

                <div className="border-t pt-5">

                  <label className="block text-sm font-medium mb-1">
                    Estampas com fotos
                  </label>

                  <p className="text-xs text-gray-500 mb-4">
                    Use esta opção quando o mesmo produto
                    tiver estampas diferentes com fotos
                    próprias.
                  </p>

                  <div className="space-y-4">

                    {variacoes.map(
                      (variacao, index) => (
                        <div
                          key={index}
                          className="border rounded-xl p-4 bg-gray-50"
                        >

                          <div className="flex justify-between items-center mb-3">

                            <p className="font-semibold text-roxo-escuro">
                              Estampa {index + 1}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removerVariacao(
                                  index
                                )
                              }
                              className="text-red-500 text-sm"
                            >
                              🗑️ Remover
                            </button>

                          </div>

                          <input
                            type="text"
                            value={variacao.nome}
                            onChange={(e) =>
                              alterarNomeVariacao(
                                index,
                                e.target.value
                              )
                            }
                            placeholder="Ex: Floral Rosa"
                            className="w-full border rounded-xl px-4 py-3 mb-3 bg-white"
                          />

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              alterarArquivoVariacao(
                                index,
                                e.target.files?.[0] ||
                                  null
                              )
                            }
                            className="w-full border rounded-xl px-4 py-3 bg-white"
                          />

                          {variacao.arquivo && (
                            <p className="text-xs text-gray-500 mt-2">
                              📷{" "}
                              {variacao.arquivo.name}
                            </p>
                          )}

                        </div>
                      )
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={adicionarVariacao}
                    className="mt-4 w-full border border-roxo text-roxo rounded-xl py-3 font-semibold"
                  >
                    ➕ Adicionar estampa com foto
                  </button>

                </div>

                {/* MENSAGENS */}

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

                {/* SALVAR */}

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

  // =========================
  // TELA DE LOGIN
  // =========================

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

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium mb-1">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Digite seu e-mail"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            {/* SENHA */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                placeholder="Digite sua senha"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            {/* ERRO */}

            {erro && (
              <p className="text-red-500 text-sm text-center">
                {erro}
              </p>
            )}

            {/* BOTÃO */}

            <button
              onClick={entrar}
              disabled={carregando}
              className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {carregando
                ? "Entrando..."
                : "Entrar"}
            </button>

          </div>

        </div>

      </div>
    </main>
  )
}


