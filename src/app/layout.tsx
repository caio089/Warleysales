import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "@/shared/ui/toaster";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Warley — Central Operacional", template: "%s · Warley" },
  description: "Central de gestão operacional com órgãos parceiros — solicitações, estoque, entregas e documentos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
