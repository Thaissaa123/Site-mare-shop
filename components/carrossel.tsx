"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

type Slide = {
  id: number
  imagem: string
  titulo: string
  texto: string | null
  ordem: number
}

export default function Carrossel() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [atual, setAtual] = useState(0)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function buscarSlides() {
      const { data, error } = await supabase
        .from("carrossel")
        .select("*")
        .order("ordem", { ascending: true })

      if (error) {
        console.error("Erro ao buscar slides:", error)
        setCarregando(false)
        return
      }

      setSlides(data || [])
      setCarregando(false)
    }

    buscarSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return

    const intervalo = setInterval(() => {
      setAtual((i) =>
        i === slides.length - 1 ? 0 : i + 1
      )
    }, 4000)

    return () => clearInterval(intervalo)
  }, [slides.length])

  function anterior() {
    setAtual((i) =>
      i === 0 ? slides.length - 1 : i - 1
    )
  }

  function proximo() {
    setAtual((i) =>
      i === slides.length - 1 ? 0 : i + 1
    )
  }

  if (carregando) {
    return (
      <section className="relative w-full h-80 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Carregando...</p>
      </section>
    )
  }

  if (slides.length === 0) {
    return null
  }

  const slide = slides[atual]

  return (
    <section className="relative w-full">
      <img
        src={slide.imagem || "/placeholder.svg"}
        alt={slide.titulo}
        className="w-full h-80 object-cover"
      />

      {/* Texto sobre a imagem */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white text-center px-4">
        <h2 className="text-2xl font-bold">
          {slide.titulo}
        </h2>

        {slide.texto && (
          <p className="mt-1">
            {slide.texto}
          </p>
        )}
      </div>

      {/* Seta esquerda */}
      {slides.length > 1 && (
        <button
          onClick={anterior}
          aria-label="Slide anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-roxo rounded-full w-9 h-9"
        >
          ‹
        </button>
      )}

      {/* Seta direita */}
      {slides.length > 1 && (
        <button
          onClick={proximo}
          aria-label="Próximo slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-roxo rounded-full w-9 h-9"
        >
          ›
        </button>
      )}

      {/* Bolinhas */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setAtual(i)}
              aria-label={`Ir para o slide ${i + 1}`}
              className={`w-2 h-2 rounded-full ${
                i === atual
                  ? "bg-white"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}