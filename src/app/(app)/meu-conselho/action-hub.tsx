import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  FileCheck,
  FileText,
  Package,
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
 * Seção "O que você pode fazer": Grid responsivo de 3 colunas (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
 * com títulos completos sem truncate, ícones destacados e descrições legíveis.
 */
export function ActionHub({ items }: { items: ActionItem[] }) {
  return (
    <section aria-label="Ações do conselho">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map(({ href, title, detail, icon: Icon, primary, disabled, onClick, customTrigger, renderTrigger }) => {
          const className = cn(
            "group text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 w-full shadow-2xs",
            primary
              ? "bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-white border-orange-200/90 hover:border-orange-300"
              : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50",
            disabled
              ? "pointer-events-none opacity-50 cursor-not-allowed"
              : "hover:-translate-y-0.5 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          );

          const body = (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition",
                    primary
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 group-hover:bg-[#0F2942] group-hover:text-white",
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {detail}
                  </p>
                </div>
              </div>

              {!disabled ? (
                <ArrowRight
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                    primary ? "text-orange-500" : "text-slate-400",
                  )}
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
      </div>
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
      href: `/solicitacoes/nova${q}`,
      title: "Nova solicitação",
      detail: "Pedir materiais ou equipamentos",
      icon: ShoppingCart,
      primary: true,
      disabled: !input.canCreateRequest,
    },
    {
      href: `/processos/novo${q}`,
      title: "Novo processo",
      detail: "Anexar documentos e demandas",
      icon: FileText,
      primary: true,
      disabled: !input.canCreateProcess,
    },
    {
      href: `/meu-conselho${q}#agendar-reuniao`,
      title: "Agendar reunião",
      detail: "Marcar alinhamento com Warley",
      icon: Calendar,
      disabled: !input.canManageMeeting,
      customTrigger: input.meetingTrigger,
      renderTrigger: input.renderMeetingTrigger,
    },
    {
      href: `/estoque${q}`,
      title: "Ver estoque",
      detail: "Saldos disponíveis na sede",
      icon: Package,
    },
    {
      href: "/solicitacoes",
      title: "Solicitações",
      detail: "Todas as demandas do órgão",
      icon: ClipboardList,
    },
    {
      href: "/atas",
      title: "Atas vigentes",
      detail: "Saldo e vigência de atas",
      icon: FileCheck,
    },
  ];
}
