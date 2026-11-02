import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold">Gestão de Conselhos</h1>
        <p className="mb-6 text-sm text-muted-foreground">Acesso restrito a usuários convidados.</p>
        {children}
      </div>
    </main>
  );
}
