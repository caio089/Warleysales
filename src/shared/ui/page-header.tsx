import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Ações principais (botões) alinhadas à direita. */
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-3xl font-medium tracking-tight text-primary md:text-[2.15rem]">{title}</h1>
        <span className="mt-3 block h-0.5 w-10 rounded-full bg-highlight" aria-hidden />
        {description ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Rótulo de seção no padrão institucional (tracking largo, caixa alta). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{children}</p>;
}
