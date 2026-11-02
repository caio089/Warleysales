import { Suspense, type ReactNode } from "react";
import { LoadingState } from "@/shared/ui/feedback-states";
import { AuthenticatedShell } from "./authenticated-shell";

/**
 * Com Cache Components, a leitura de sessão (cookies) é dinâmica e precisa ficar atrás de
 * <Suspense>. O shell estático (fallback) carrega instantaneamente.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6"><LoadingState title="Carregando…" /></div>}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
