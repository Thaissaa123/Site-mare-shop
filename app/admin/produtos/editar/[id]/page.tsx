"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

type FotoProduto = {
  id?: number
  produto_id?: number
  cor: string
  imagem: string
  arquivo: File | null
  nova?: boolean
}

export default function EditarProduto() {
  const params = useParams()
  const id = Number(params.id)

  const [nome, setNome] = useState("")
  const [preco, setPreco] = useState("")
  const [categoria, setCategoria] = useState("vestidos")

  const [tamanhos, setTamanhos] = useState<string[]>([])
  const [cores, setCores] = useState<string[]>([])
  const [fotos, setFotos] = useState<FotoProduto[]>([])

  const [coresOriginais, setCoresOriginais] = useState<string[]>([])
  const [fotosOriginais, setFotosOriginais] = useState<FotoProduto[]>([])

  const [novaCor, setNovaCor] = useState("")

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [erro, setErro] = useState("")
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    if (id) {
      buscarProduto()
    }
  }, [id])

  async function buscarProduto() {
    setCarregando(true)
    setErro("")

    // Busca o produto
    const { data: produto, error: erroProduto } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single()

    if (erroProduto) {
      console.error(erroProduto)
      setErro(
        `Erro ao carregar produto: ${
          erroProduto.message || "Erro desconhecido"
        }`
      )
      setCarregando(false)
      return
    }

    setNome(produto.nome || "")
    setPreco(String(produto.preco ?? ""))
    setCategoria(produto.categoria || "vestidos")
    setTamanhos(produto.tamanhos || [])

    // Busca as fotos das cores na tabela nova
    const { data: fotosSalvas, error: erroFotos } = await supabase
      .from("fotos_produto")
      .select("*")
      .eq("produto_id", id)
      .order("ordem", { ascending: true })

    if (erroFotos) {
      console.error(erroFotos)

      setErro(
        `Erro ao carregar as fotos: ${
          erroFotos.message || "Erro desconhecido"
        }`
      )

      setCarregando(false)
      return
    }

    const fotosFormatadas: FotoProduto[] = (fotosSalvas || []).map(
      (foto) => ({
        id: foto.id,
        produto_id: foto.produto_id,
        cor: foto.cor,
        imagem: foto.imagem,
        arquivo: null,
        nova: false,
      })
    )

    setFotos(fotosFormatadas)
    setFotosOriginais(fotosFormatadas)

    const coresSalvas = fotosFormatadas.map((foto) => foto.cor)

    setCores(coresSalvas)
    setCoresOriginais(coresSalvas)

    setCarregando(false)
  }

  function selecionarTamanho(tamanho: string) {
    setTamanhos((atuais) =>
      atuais.includes(tamanho)
        ? atuais.filter((item) => item !== tamanho)
        : [...atuais, tamanho]
    )
  }

  function adicionarCor() {
    const cor = novaCor.trim()

    if (!cor) {
      setErro("Digite o nome da cor.")
      return
    }

    const jaExiste = cores.some(
      (item) => item.toLowerCase() === cor.toLowerCase()
    )

    if (jaExiste) {
      setErro("Essa cor já está cadastrada.")
      return
    }

    setErro("")

    setCores((atuais) => [...atuais, cor])

    setFotos((atuais) => [
      ...atuais,
      {
        cor,
        imagem: "",
        arquivo: null,
        nova: true,
      },
    ])

    setNovaCor("")
  }

  function excluirCor(cor: string) {
    const confirmar = window.confirm(
      `Deseja realmente excluir a cor "${cor}" deste produto?`
    )

    if (!confirmar) return

    setCores((atuais) =>
      atuais.filter(
        (item) => item.toLowerCase() !== cor.toLowerCase()
      )
    )

    setFotos((atuais) =>
      atuais.filter(
        (foto) => foto.cor.toLowerCase() !== cor.toLowerCase()
      )
    )

    setErro("")
    setMensagem("")
  }

  function alterarArquivoCor(
    cor: string,
    arquivo: File | null
  ) {
    setFotos((atuais) =>
      atuais.map((foto) =>
        foto.cor.toLowerCase() === cor.toLowerCase()
          ? {
              ...foto,
              arquivo,
            }
          : foto
      )
    )
  }

  async function salvarAlteracoes() {
    setErro("")
    setMensagem("")

    if (!nome.trim() || !preco || !categoria) {
      setErro("Preencha todos os campos.")
      return
    }

    if (tamanhos.length === 0) {
      setErro("Escolha pelo menos um tamanho.")
      return
    }

    if (cores.length === 0) {
      setErro("Cadastre pelo menos uma cor.")
      return
    }

    // Verifica se todas as cores possuem foto
    const corSemFoto = fotos.find(
      (foto) => !foto.imagem && !foto.arquivo
    )

    if (corSemFoto) {
      setErro(
        `Escolha uma foto para a cor ${corSemFoto.cor}.`
      )
      return
    }

    setSalvando(true)

    try {
      // =====================================================
  // =====================================================
// 1. DESCOBRIR QUAIS FOTOS FORAM EXCLUÍDAS
// =====================================================

const fotosRemovidas = fotosOriginais.filter(
  (fotoOriginal) =>
    !cores.some(
      (corAtual) =>
        corAtual.toLowerCase().trim() ===
        fotoOriginal.cor.toLowerCase().trim()
    )
)

// =====================================================
// 2. EXCLUIR AS FOTOS REMOVIDAS PELO ID
// =====================================================

for (const fotoRemovida of fotosRemovidas) {
  if (!fotoRemovida.id) continue

  const { error: erroDelete } = await supabase
    .from("fotos_produto")
    .delete()
    .eq("id", fotoRemovida.id)

  if (erroDelete) {
    console.error(erroDelete)

    setErro(
      `Não foi possível excluir a cor ${fotoRemovida.cor}.`
    )

    setSalvando(false)
    return
  }
}
      // =====================================================
      // 3. ENVIAR / ATUALIZAR FOTOS DAS CORES
      // =====================================================

      const fotosFinais: {
        cor: string
        imagem: string
      }[] = []

      for (const foto of fotos) {
        let urlImagem = foto.imagem

        // Se foi escolhida uma nova imagem
        if (foto.arquivo) {
          const nomeArquivo =
            `${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 8)}-${foto.arquivo.name.replace(/\s/g, "-")}`

          const { error: uploadError } = await supabase.storage
            .from("produtos")
            .upload(nomeArquivo, foto.arquivo)

          if (uploadError) {
            console.error(uploadError)

            setErro(
              `Não foi possível enviar a foto da cor ${foto.cor}.`
            )

            setSalvando(false)
            return
          }

          const { data: imagemData } = supabase.storage
            .from("produtos")
            .getPublicUrl(nomeArquivo)

          urlImagem = imagemData.publicUrl
        }

        fotosFinais.push({
          cor: foto.cor,
          imagem: urlImagem,
        })

        // =====================================================
        // SE A FOTO JÁ EXISTE → ATUALIZA
        // SE É NOVA → INSERE
        // =====================================================

        if (foto.id) {
          const { error: erroUpdate } = await supabase
            .from("fotos_produto")
            .update({
              cor: foto.cor,
              imagem: urlImagem,
            })
            .eq("id", foto.id)

          if (erroUpdate) {
            console.error(erroUpdate)

            setErro(
              `Não foi possível atualizar a foto da cor ${foto.cor}.`
            )

            setSalvando(false)
            return
          }
        } else {
          const { error: erroInsert } = await supabase
            .from("fotos_produto")
            .insert({
              produto_id: id,
              cor: foto.cor,
              imagem: urlImagem,
              ordem: fotosFinais.length - 1,
            })

          if (erroInsert) {
            console.error(erroInsert)

            setErro(
              `Não foi possível salvar a foto da cor ${foto.cor}.`
            )

            setSalvando(false)
            return
          }
        }
      }

      // =====================================================
      // 4. ATUALIZAR PRODUTO
      // =====================================================

      const primeiraFoto =
        fotosFinais.length > 0
          ? fotosFinais[0].imagem
          : ""

      const { error: erroProduto } = await supabase
        .from("produtos")
        .update({
          nome: nome.trim(),
          preco: Number(preco),
          categoria,
          tamanhos,
          cores,
          // Mantemos essa coluna apenas por compatibilidade
          // com o banco antigo.
          imagem: primeiraFoto,
        })
        .eq("id", id)

      if (erroProduto) {
        console.error(erroProduto)

        setErro(
          `Não foi possível salvar o produto: ${
            erroProduto.message || "Erro desconhecido"
          }`
        )

        setSalvando(false)
        return
      }

      // =====================================================
      // 5. RECARREGAR OS DADOS
      // =====================================================

      await buscarProduto()

      setMensagem("Produto atualizado com sucesso! 🎉")
      setSalvando(false)
    } catch (error) {
      console.error(error)

      setErro("Ocorreu um erro ao salvar as alterações.")
      setSalvando(false)
    }
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

        {/* VOLTAR */}

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

          <div className="space-y-5">

            {/* ================================================= */}
            {/* NOME */}
            {/* ================================================= */}

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

            {/* ================================================= */}
            {/* PREÇO */}
            {/* ================================================= */}

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

            {/* ================================================= */}
            {/* CATEGORIA */}
            {/* ================================================= */}

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
                <option value="shorts-e-saias">
                  Shorts e Saias
                </option>
                <option value="vestidos">Vestidos</option>
                <option value="conjuntos">Conjuntos</option>
                <option value="acessorios">Acessórios</option>
                <option value="colecao-inverno">
                  Coleção Inverno
                </option>
              </select>
            </div>

            {/* ================================================= */}
            {/* TAMANHOS */}
            {/* ================================================= */}

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
                      selecionarTamanho(tamanho)
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

            {/* ================================================= */}
            {/* CORES CADASTRADAS */}
            {/* ================================================= */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Cores
              </label>

              <p className="text-xs text-gray-500 mb-3">
                Aqui aparecem somente as cores cadastradas
                neste produto.
              </p>

              {cores.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Nenhuma cor cadastrada.
                </p>
              ) : (
                <div className="space-y-2">

                  {cores.map((cor) => (
                    <div
                      key={cor}
                      className="flex items-center justify-between border rounded-xl px-4 py-3 bg-gray-50"
                    >
                      <span className="font-medium text-roxo-escuro">
                        {cor}
                      </span>

                      <button
                        type="button"
                        onClick={() => excluirCor(cor)}
                        className="text-red-500 text-sm font-medium hover:text-red-700"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* ================================================= */}
            {/* ADICIONAR NOVA COR */}
            {/* ================================================= */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Adicionar cor
              </label>

              <div className="flex gap-2">

                <input
                  type="text"
                  value={novaCor}
                  onChange={(e) => setNovaCor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      adicionarCor()
                    }
                  }}
                  placeholder="Ex.: Azul-marinho"
                  className="flex-1 border rounded-xl px-4 py-3"
                />

                <button
                  type="button"
                  onClick={adicionarCor}
                  className="bg-roxo text-white rounded-xl px-4 font-medium"
                >
                  + Adicionar
                </button>

              </div>
            </div>

            {/* ================================================= */}
            {/* FOTOS DAS CORES */}
            {/* ================================================= */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Fotos das cores
              </label>

              <p className="text-xs text-gray-500 mb-4">
                Escolha uma foto para cada cor cadastrada.
              </p>

              <div className="space-y-4">

                {fotos.map((foto) => (
                  <div
                    key={`${foto.cor}-${foto.id || "nova"}`}
                    className="border rounded-xl p-4 bg-gray-50"
                  >

                    <div className="flex items-center justify-between mb-3">

                      <p className="font-semibold text-roxo-escuro">
                        📷 {foto.cor}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          excluirCor(foto.cor)
                        }
                        className="text-red-500 text-xs font-medium"
                      >
                        🗑️ Excluir cor
                      </button>

                    </div>

                    {/* FOTO ATUAL */}

                    {foto.imagem && !foto.arquivo && (
                      <img
                        src={foto.imagem}
                        alt={`Foto da cor ${foto.cor}`}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                    )}

                    {/* NOVA FOTO */}

                    {foto.arquivo && (
                      <img
                        src={URL.createObjectURL(foto.arquivo)}
                        alt={`Nova foto da cor ${foto.cor}`}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const arquivo =
                          e.target.files?.[0] || null

                        alterarArquivoCor(
                          foto.cor,
                          arquivo
                        )
                      }}
                      className="w-full border rounded-xl px-4 py-3 bg-white"
                    />

                    {foto.arquivo && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {foto.arquivo.name}
                      </p>
                    )}

                  </div>
                ))}

              </div>
            </div>

            {/* ================================================= */}
            {/* ERRO */}
            {/* ================================================= */}

            {erro && (
              <p className="text-red-500 text-sm">
                {erro}
              </p>
            )}

            {/* ================================================= */}
            {/* SUCESSO */}
            {/* ================================================= */}

            {mensagem && (
              <p className="text-green-600 text-sm">
                {mensagem}
              </p>
            )}

            {/* ================================================= */}
            {/* SALVAR */}
            {/* ================================================= */}

            <button
              onClick={salvarAlteracoes}
              disabled={salvando}
              className="w-full bg-roxo text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : "💾 Salvar alterações"}
            </button>

          </div>

        </div>

      </div>
    </main>
  )
}