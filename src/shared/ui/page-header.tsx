import type { ReactNode } from "react";
import Link from "next/link";
import { ReturnLink } from "./contextual-link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Linha curta acima do título (contexto da seção). */
  eyebrow?: string;
  /** Ações principais (botões) alinhadas à direita. */
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  returnToPath?: string;
}

export function PageHeader({ title, description, eyebrow, actions, backHref, backLabel = "Voltar", returnToPath }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-border pb-5">
      <div className="min-w-0 basis-full lg:flex-1">
        {backHref ? (returnToPath ? <ReturnLink expectedPath={returnToPath} className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" aria-hidden />{backLabel}</ReturnLink> : <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" aria-hidden />{backLabel}</Link>) : null}
        {eyebrow ? (
          <p className="mb-2 text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="break-words font-heading text-3xl font-semibold tracking-tight text-primary md:text-[2.25rem]">{title}</h1>
        <span className="mt-3 block h-0.5 w-11 rounded-full bg-highlight" aria-hidden />
        {description ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Rótulo de seção no padrão institucional (tracking largo, caixa alta). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{children}</p>;
}
