import type { ReactNode } from "react";

/**
 * Entrada da página via CSS (não GSAP): o conteúdo vem do servidor e não pode
 * receber estilos inline na hidratação.
 */
export function PageReveal({ children }: { children: ReactNode }) {
  return <div className="reveal-scope">{children}</div>;
}
