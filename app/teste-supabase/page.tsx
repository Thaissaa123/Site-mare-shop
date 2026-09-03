import { supabase } from "@/lib/supabase"

export default async function TesteSupabase() {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        Teste do Supabase
      </h1>

      {error ? (
        <p className="mt-4 text-red-600">
          Erro: {error.message}
        </p>
      ) : (
        <pre className="mt-4">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  )
}