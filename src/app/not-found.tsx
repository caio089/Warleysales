import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">O conteúdo não existe ou você não tem acesso a ele.</p>
      <Link href="/dashboard" className="text-sm text-primary underline-offset-4 hover:underline">Ir para o painel</Link>
    </main>
  );
}
