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

interface ActionItem {
  href: string;
  title: string;
  detail: string;
  icon: LucideIcon;
  primary?: boolean;
  disabled?: boolean;
}

/** Atalhos grandes do dia a dia do conselho — um clique para a ação. */
export function ActionHub({ items }: { items: ActionItem[] }) {
  return (
    <section aria-label="Ações do conselho" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ href, title, detail, icon: Icon, primary, disabled }) => {
        const className = cn(
          "surface-card group flex items-start gap-3 p-4 text-left transition-colors",
          primary && "border-highlight/30 bg-highlight/5",
          disabled ? "pointer-events-none opacity-50" : "card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        );
        const body = (
          <>
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-2xl",
                primary ? "bg-highlight text-highlight-foreground" : "bg-secondary text-primary",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-base font-medium tracking-tight text-primary">{title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{detail}</span>
            </span>
            {!disabled ? (
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-highlight" aria-hidden />
            ) : null}
          </>
        );
        return disabled ? (
          <div key={title} className={className} aria-disabled>
            {body}
          </div>
        ) : (
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
}): ActionItem[] {
  const q = `?councilId=${input.councilId}`;
  return [
    {
      href: "/solicitacoes/nova",
      title: "Nova solicitação",
      detail: "Pedir material: criar → enviar → aprovar → receber",
      icon: ShoppingCart,
      primary: true,
      disabled: !input.canCreateRequest,
    },
    {
      href: "/processos/novo",
      title: "Novo processo / documentos",
      detail: "Abrir processo e anexar os 7 documentos",
      icon: FilePlus2,
      primary: true,
      disabled: !input.canCreateProcess,
    },
    {
      href: `/meu-conselho${q}#agendar-reuniao`,
      title: "Agendar reunião",
      detail: "Marque data e horário do conselho",
      icon: CalendarPlus,
      disabled: !input.canManageMeeting,
    },
    {
      href: `/estoque${q}`,
      title: "Ver estoque",
      detail: "Saldos e itens deste conselho",
      icon: Package,
    },
    {
      href: "/solicitacoes",
      title: "Todas as solicitações",
      detail: "Acompanhar andamento e recebimentos",
      icon: ClipboardPlus,
    },
    {
      href: "/atas",
      title: "Atas de preços",
      detail: "Saldo e vigência das atas",
      icon: ScrollText,
    },
  ];
}
