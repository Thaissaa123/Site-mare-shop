"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type FotoCor = {
  cor: string
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

  const [tamanhos, setTamanhos] = useState<string[]>([])
  const [cores, setCores] = useState<string[]>([])
  const [fotosCores, setFotosCores] = useState<FotoCor[]>([])

  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")

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
  // CORES
  // =========================

  function adicionarCor() {
    const input = document.getElementById(
      "nova-cor"
    ) as HTMLInputElement | null

    if (!input) return

    const novaCor = input.value.trim()

    if (!novaCor) return

    const corJaExiste = cores.some(
      (cor) => cor.toLowerCase() === novaCor.toLowerCase()
    )

    if (corJaExiste) {
      setErro("Essa cor já foi adicionada.")
      return
    }

    setCores((atuais) => [...atuais, novaCor])

    setFotosCores((atuais) => [
      ...atuais,
      {
        cor: novaCor,
        arquivo: null,
      },
    ])

    input.value = ""
    setErro("")
  }

  function removerCor(cor: string) {
    setCores((atuais) =>
      atuais.filter((item) => item !== cor)
    )

    setFotosCores((atuais) =>
      atuais.filter((item) => item.cor !== cor)
    )
  }

  // =========================
  // FOTO DE CADA COR
  // =========================

  function alterarFotoCor(
    index: number,
    arquivo: File | null
  ) {
    setFotosCores((atuais) =>
      atuais.map((item, i) =>
        i === index
          ? {
              ...item,
              arquivo,
            }
          : item
      )
    )

    setErro("")
  }

  // =========================
  // SALVAR PRODUTO
  // =========================

  async function salvarProduto() {
    setMensagem("")
    setErro("")

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("USUÁRIO LOGADO:", session?.user?.id)

    if (!session) {
      setErro("Sua sessão expirou. Faça login novamente.")
      return
    }

    if (
      !nome.trim() ||
      !preco ||
      !categoria
    ) {
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

    // =========================
    // VERIFICAR FOTOS DAS CORES
    // =========================

    const algumaCorSemFoto = fotosCores.some(
      (foto) => !foto.arquivo
    )

    if (algumaCorSemFoto) {
      setErro(
        "Escolha uma foto para todas as cores cadastradas."
      )
      return
    }

    setSalvando(true)

    try {
      // =========================
      // ENVIAR FOTOS DAS CORES
      // =========================

      const fotosSalvas: {
        cor: string
        imagem: string
      }[] = []

      for (let i = 0; i < fotosCores.length; i++) {
        const fotoCor = fotosCores[i]

        if (!fotoCor.arquivo) {
          continue
        }

        const nomeArquivoCor =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}-${fotoCor.arquivo.name.replace(
            /\s/g,
            "-"
          )}`

        const { error: erroUploadCor } =
          await supabase.storage
            .from("produtos")
            .upload(
              nomeArquivoCor,
              fotoCor.arquivo
            )

        if (erroUploadCor) {
          console.error(erroUploadCor)

          setErro(
            `Não foi possível enviar a foto da cor ${fotoCor.cor}.`
          )

          setSalvando(false)
          return
        }

        const { data: imagemCorData } =
          supabase.storage
            .from("produtos")
            .getPublicUrl(
              nomeArquivoCor
            )

        const urlFotoCor =
          imagemCorData.publicUrl

        fotosSalvas.push({
          cor: fotoCor.cor,
          imagem: urlFotoCor,
        })
      }

      // =========================
      // VERIFICAR SE AS FOTOS FORAM SALVAS
      // =========================

      if (fotosSalvas.length === 0) {
        setErro(
          "Adicione pelo menos uma foto ao produto."
        )

        setSalvando(false)
        return
      }

      // =========================
      // CRIAR PRODUTO
      // =========================
      //
      // A coluna "imagem" ainda existe na tabela
      // produtos. Para manter o banco funcionando,
      // usamos automaticamente a primeira foto cadastrada.
      //
      // Isso NÃO significa que ela seja uma "foto principal".
      // Para o cliente, todas as fotos são opções do produto.
      // =========================

      const { data: produtoCriado, error: erroProduto } =
        await supabase
          .from("produtos")
          .insert({
            nome: nome.trim(),
            preco: Number(preco),
            categoria,
            imagem: fotosSalvas[0].imagem,
            tamanhos,
            cores,
          })
          .select("id")
          .single()

      if (erroProduto || !produtoCriado) {
        console.error(erroProduto)

        setErro(
          "Não foi possível salvar o produto."
        )

        setSalvando(false)
        return
      }

      // =========================
      // SALVAR FOTOS NO BANCO
      // =========================

      for (let i = 0; i < fotosSalvas.length; i++) {
        const foto = fotosSalvas[i]

        const { error: erroFoto } =
          await supabase
            .from("fotos_produto")
            .insert({
              produto_id: produtoCriado.id,
              cor: foto.cor,
              imagem: foto.imagem,
              ordem: i,
            })

        if (erroFoto) {
          console.error(erroFoto)

          setErro(
            `Não foi possível salvar a foto da cor ${foto.cor}.`
          )

          setSalvando(false)
          return
        }
      }

      // =========================
      // LIMPAR FORMULÁRIO
      // =========================

      setNome("")
      setPreco("")
      setCategoria("vestidos")
      setTamanhos([])
      setCores([])
      setFotosCores([])

      const inputNovaCor =
        document.getElementById(
          "nova-cor"
        ) as HTMLInputElement | null

      if (inputNovaCor) {
        inputNovaCor.value = ""
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
                      placeholder="Ex: Rosa"
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

                {/* FOTOS DAS CORES */}

                <div className="border-t pt-5">

                  <label className="block text-sm font-medium mb-1">
                    Fotos do produto
                  </label>

                  <p className="text-xs text-gray-500 mb-4">
                    Adicione uma foto para cada cor ou
                    estampa cadastrada.
                  </p>

                  <div className="space-y-4">

                    {fotosCores.map(
                      (fotoCor, index) => (
                        <div
                          key={fotoCor.cor}
                          className="border rounded-xl p-4 bg-gray-50"
                        >

                          <p className="font-semibold text-roxo-escuro mb-3">
                            📷 {fotoCor.cor}
                          </p>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              alterarFotoCor(
                                index,
                                e.target.files?.[0] ||
                                  null
                              )
                            }
                            className="w-full border rounded-xl px-4 py-3 bg-white"
                          />

                          {fotoCor.arquivo && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓{" "}
                              {fotoCor.arquivo.name}
                            </p>
                          )}

                        </div>
                      )
                    )}

                  </div>

                  {cores.length === 0 && (
                    <p className="text-xs text-gray-500 mt-3">
                      Adicione primeiro as cores do
                      produto.
                    </p>
                  )}

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



