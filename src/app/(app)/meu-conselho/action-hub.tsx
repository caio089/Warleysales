import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  ClipboardPlus,
  FilePlus2,
  Package,
  ScrollText,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  href: string;
  title: string;
  detail: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  primary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  customTrigger?: ReactNode;
  renderTrigger?: (className: string, body: ReactNode) => ReactNode;
}

/**
 * Barra de atalhos rápidos do conselho — formato compacto e executivo de perfil baixo.
 * Layout horizontal em linha única em desktop (lg:grid-cols-6) e 2 linhas em tablet (sm:grid-cols-3).
 */
export function ActionHub({ items }: { items: ActionItem[] }) {
  return (
    <section aria-label="Ações do conselho" className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(({ href, title, detail, icon: Icon, primary, disabled, onClick, customTrigger, renderTrigger }) => {
        const className = cn(
          "group flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
          primary
            ? "border-highlight/30 bg-highlight/5 hover:border-highlight/60 hover:bg-highlight/10"
            : "border-border/70 bg-card hover:border-highlight/35 hover:bg-accent/40",
          disabled
            ? "pointer-events-none opacity-50 cursor-not-allowed"
            : "hover:-translate-y-0.5 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        );

        const body = (
          <>
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                primary
                  ? "bg-highlight text-highlight-foreground"
                  : "bg-secondary text-primary group-hover:bg-highlight/15 group-hover:text-highlight",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-xs font-semibold tracking-tight text-primary transition-colors group-hover:text-highlight truncate">
                {title}
              </span>
              <span className="block text-[0.68rem] text-muted-foreground truncate leading-tight mt-0.5">
                {detail}
              </span>
            </span>
            {!disabled ? (
              <ArrowRight
                className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-highlight"
                aria-hidden
              />
            ) : null}
          </>
        );

        if (disabled) {
          return (
            <div key={title} className={className} aria-disabled="true">
              {body}
            </div>
          );
        }

        if (renderTrigger) {
          return (
            <div key={title} className="contents">
              {renderTrigger(className, body)}
            </div>
          );
        }

        if (customTrigger) {
          return (
            <div key={title} className="contents">
              {customTrigger}
            </div>
          );
        }

        if (onClick) {
          return (
            <button key={title} type="button" onClick={onClick} className={className}>
              {body}
            </button>
          );
        }

        return (
          <Link key={href} href={href} className={className}>
            {body}
          </Link>
        );
      })}
    </section>
  );
}

export function buildCouncilActions(input: {
  councilId: string;
  canCreateRequest: boolean;
  canCreateProcess: boolean;
  canManageMeeting: boolean;
  meetingTrigger?: ReactNode;
  renderMeetingTrigger?: (className: string, body: ReactNode) => ReactNode;
}): ActionItem[] {
  const q = `?councilId=${input.councilId}`;
  return [
    {
      href: "/solicitacoes/nova",
      title: "Nova solicitação",
      detail: "Pedir material",
      icon: ShoppingCart,
      primary: true,
      disabled: !input.canCreateRequest,
    },
    {
      href: "/processos/novo",
      title: "Novo processo",
      detail: "Anexar documentos",
      icon: FilePlus2,
      primary: true,
      disabled: !input.canCreateProcess,
    },
    {
      href: `/meu-conselho${q}#agendar-reuniao`,
      title: "Agendar reunião",
      detail: "Marcar data e horário",
      icon: CalendarPlus,
      disabled: !input.canManageMeeting,
      customTrigger: input.meetingTrigger,
      renderTrigger: input.renderMeetingTrigger,
    },
    {
      href: `/estoque${q}`,
      title: "Ver estoque",
      detail: "Saldos e itens",
      icon: Package,
    },
    {
      href: "/solicitacoes",
      title: "Solicitações",
      detail: "Todas as demandas",
      icon: ClipboardPlus,
    },
    {
      href: "/atas",
      title: "Atas de preços",
      detail: "Saldo e vigência",
      icon: ScrollText,
    },
  ];
}
