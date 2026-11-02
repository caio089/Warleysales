import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BrandMark } from "@/shared/ui/brand-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <BrandMark />
      <span className="mt-4 block h-0.5 w-10 rounded-full bg-highlight" aria-hidden />
      <h1 className="font-heading text-3xl font-medium tracking-tight text-primary">Página não encontrada</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">O conteúdo não existe ou você não tem acesso a ele.</p>
      <Link href="/dashboard" className={buttonVariants()}>Ir para o painel</Link>
    </main>
  );
}
