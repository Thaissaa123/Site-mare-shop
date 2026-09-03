import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CarrinhoProvider } from "@/components/carrinho-context"
import { CategoriaProvider } from "@/components/categoria-context";
import { BuscaProvider } from "@/components/busca-context"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maré Shop - Roupas e Acessórios",
  description: "Moda feminina com estilo. Roupas e acessórios para todas as ocasiões.",

};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body>
      <CarrinhoProvider>
  <CategoriaProvider>
    <BuscaProvider>
      {children}
    </BuscaProvider>
  </CategoriaProvider>
</CarrinhoProvider>
      </body>
    </html>
  
  );
}
