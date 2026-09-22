"use client"

import { useEffect, useState } from "react"
import ProdutoCard from "@/components/produto-card"
import { useCategoria } from "@/components/categoria-context"
import { useBusca } from "@/components/busca-context"
import { supabase } from "@/lib/supabase"

type FotoProduto = {
  id: number
  produto_id: number
  cor: string
  imagem: string
  ordem: number
}

type CategoriaProduto = {
  id: number
  produto_id: number
  categoria_principal: string
  subcategoria: string | null
}

type Produto = {
  id: number
  nome: string
  preco: number
  categoria: string
  imagem: string
  tamanhos: string[]
  cores: string[]

  variacoes: {
    nome: string
    imagem: string
  }[]

  fotos: FotoProduto[]

  categorias: CategoriaProduto[]
}

export default function ListaProdutos() {
  const {
  categoria,
  subcategoria,
  voltarParaCategoria,
  limparCategoria,
} = useCategoria()
  const { busca } = useBusca()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function buscarProdutos() {
      setCarregando(true)

      // =========================================
      // BUSCAR PRODUTOS
      // =========================================

      const {
        data: produtosData,
        error: erroProdutos,
      } = await supabase
        .from("produtos")
        .select("*")
        .order("id", {
          ascending: true,
        })

      if (erroProdutos) {
        console.error(
          "ERRO AO BUSCAR PRODUTOS:",
          {
            mensagem: erroProdutos.message,
            detalhes: erroProdutos.details,
            dica: erroProdutos.hint,
            codigo: erroProdutos.code,
          }
        )

        setCarregando(false)
        return
      }

      if (
        !produtosData ||
        produtosData.length === 0
      ) {
        setProdutos([])
        setCarregando(false)
        return
      }

      // =========================================
      // BUSCAR FOTOS
      // =========================================

      const {
        data: fotosData,
        error: erroFotos,
      } = await supabase
        .from("fotos_produto")
        .select("*")
        .order("ordem", {
          ascending: true,
        })

      if (erroFotos) {
        console.error(
          "ERRO AO BUSCAR FOTOS DOS PRODUTOS:",
          {
            mensagem: erroFotos.message,
            detalhes: erroFotos.details,
            dica: erroFotos.hint,
            codigo: erroFotos.code,
          }
        )
      }

      // =========================================
      // BUSCAR CATEGORIAS DOS PRODUTOS
      // =========================================

      const {
        data: categoriasData,
        error: erroCategorias,
      } = await supabase
        .from("produto_categorias")
        .select("*")

      if (erroCategorias) {
        console.error(
          "ERRO AO BUSCAR CATEGORIAS DOS PRODUTOS:",
          {
            mensagem: erroCategorias.message,
            detalhes: erroCategorias.details,
            dica: erroCategorias.hint,
            codigo: erroCategorias.code,
          }
        )
      }

      // =========================================
      // MONTAR PRODUTOS
      // =========================================

      const produtosComFotos: Produto[] =
        produtosData.map((produto) => {
          const fotosDoProduto =
            (fotosData || [])
              .filter(
                (foto) =>
                  foto.produto_id ===
                  produto.id
              )
              .sort(
                (a, b) =>
                  (a.ordem || 0) -
                  (b.ordem || 0)
              )

          const categoriasDoProduto =
            (categoriasData || []).filter(
              (categoriaProduto) =>
                categoriaProduto.produto_id ===
                produto.id
            )

          return {
            ...produto,

            fotos: fotosDoProduto,

            variacoes:
              fotosDoProduto.map(
                (foto) => ({
                  nome: foto.cor,
                  imagem: foto.imagem,
                })
              ),

            categorias:
              categoriasDoProduto,
          }
        })

      setProdutos(produtosComFotos)
      setCarregando(false)
    }

    buscarProdutos()
  }, [])

  // =========================================
  // TÍTULO
  // =========================================

  function obterTituloCategoria() {
    if (categoria === "todas") {
      return "Nossos produtos"
    }

    if (
      categoria === "vestidos" &&
      subcategoria === "vestidos-casuais"
    ) {
      return "Vestidos Casuais"
    }

    if (
      categoria === "vestidos" &&
      subcategoria === "vestidos-sociais"
    ) {
      return "Vestidos Sociais"
    }

    if (
      categoria === "vestidos" &&
      subcategoria === "vestidos-justos"
    ) {
      return "Vestidos Justos"
    }

    if (
      categoria === "blusas" &&
      subcategoria === "blusas-casuais"
    ) {
      return "Blusas Casuais"
    }

    if (
      categoria === "blusas" &&
      subcategoria === "blusas-sociais"
    ) {
      return "Blusas Sociais"
    }

    if (
      categoria === "blusas" &&
      subcategoria === "croppeds-justinhas"
    ) {
      return "Croppeds & Justinhas"
    }

    if (
      categoria === "blusas" &&
      subcategoria === "t-shirts"
    ) {
      return "T-shirts"
    }

    if (
      categoria === "shorts-e-saias" &&
      subcategoria === "shorts"
    ) {
      return "Shorts"
    }

    if (
      categoria === "shorts-e-saias" &&
      subcategoria === "saias"
    ) {
      return "Saias"
    }

    if (
      categoria === "moda-crista" &&
      subcategoria === "moda-crista-saias"
    ) {
      return "Saias"
    }

    if (
      categoria === "moda-crista" &&
      subcategoria === "moda-crista-vestidos"
    ) {
      return "Vestidos"
    }

    if (
      categoria === "moda-crista" &&
      subcategoria === "t-shirts-com-frases"
    ) {
      return "T-shirts com frases"
    }

    if (
      categoria === "moda-crista" &&
      subcategoria === "moda-crista-blusas"
    ) {
      return "Blusas"
    }

    if (categoria === "vestidos") {
      return "Vestidos"
    }

    if (categoria === "blusas") {
      return "Blusas"
    }

    if (categoria === "calcas") {
      return "Calças"
    }

    if (categoria === "shorts-e-saias") {
      return "Shorts & Saias"
    }

    if (categoria === "conjuntos") {
      return "Conjuntos"
    }

    if (categoria === "moda-crista") {
      return "Moda Cristã"
    }

    if (categoria === "acessorios") {
      return "Acessórios"
    }

    if (categoria === "colecao-inverno") {
      return "Coleção Inverno"
    }

    return categoria
  }

  // =========================================
  // FILTRAR PRODUTOS
  // =========================================

  const produtosFiltrados =
    produtos.filter((produto) => {
      let pertenceCategoria = false

      // -----------------------------------------
      // TODOS
      // -----------------------------------------

      if (categoria === "todas") {
        pertenceCategoria = true
      }

      // -----------------------------------------
      // SUBCATEGORIA
      // -----------------------------------------

      else if (subcategoria) {
        pertenceCategoria =
          produto.categorias.some(
            (categoriaProduto) =>
              categoriaProduto.categoria_principal ===
                categoria &&
              categoriaProduto.subcategoria ===
                subcategoria
          )
      }

      // -----------------------------------------
      // CATEGORIA DIRETA
      // -----------------------------------------

      else {
        pertenceCategoria =
          produto.categorias.some(
            (categoriaProduto) =>
              categoriaProduto.categoria_principal ===
                categoria
          )

        // Compatibilidade com produtos antigos
        if (!pertenceCategoria) {
          pertenceCategoria =
            produto.categoria === categoria
        }
      }

      // -----------------------------------------
      // BUSCA
      // -----------------------------------------

      const termoBusca = busca
        .toLowerCase()
        .trim()
        .replace(/s$/, "")

      const correspondeBusca =
        termoBusca === "" ||
        produto.nome
          .toLowerCase()
          .includes(termoBusca)

      return (
        pertenceCategoria &&
        correspondeBusca
      )
    })

  // =========================================
  // CARREGANDO
  // =========================================

  if (carregando) {
    return (
      <section className="px-4 py-6">
        <p className="text-center text-gray-500">
          Carregando produtos...
        </p>
      </section>
    )
  }

  // =========================================
  // PRODUTOS
  // =========================================

  return (
     <section className="px-4 py-6">

   
     {categoria !== "todas" && (
  <button
    type="button"
    onClick={() => {
      if (subcategoria) {
        voltarParaCategoria()
      } else {
        limparCategoria()
      }
    }}
    className="mb-3 text-sm font-medium text-roxo-escuro hover:underline"
  >
    ← Voltar para categorias
  </button>
)}
    

    <h2 className="mb-4 text-xl font-bold text-roxo-escuro">
      {obterTituloCategoria()}
    </h2>

      <div className="grid grid-cols-2 gap-4">
        {produtosFiltrados.length === 0 ? (
          <div className="col-span-2 py-10 text-center">
            <p className="mb-3 text-4xl">
              🔍
            </p>

            <h3 className="text-lg font-semibold text-roxo-escuro">
              Nenhum produto encontrado
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Não encontramos produtos
              para sua busca.
            </p>

            <button
              onClick={() => {
                window.location.href = "/"
              }}
              className="mt-4 rounded-full bg-roxo px-5 py-2 text-white"
            >
              Ver todos os produtos
            </button>
          </div>
        ) : (
          produtosFiltrados.map(
            (produto) => (
              <ProdutoCard
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                preco={produto.preco}
                tamanhos={produto.tamanhos}
                cores={produto.cores}
                imagem={
                  produto.fotos.length > 0
                    ? produto.fotos[0].imagem
                    : produto.imagem
                }
                variacoes={
                  produto.variacoes
                }
              />
            )
          )
        )}
      </div>
    </section>
  )
}