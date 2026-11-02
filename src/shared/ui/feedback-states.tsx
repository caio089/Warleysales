import { AlertCircle, DatabaseZap, Inbox, ShieldAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StateShellProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  role?: "status" | "alert";
  iconClassName?: string;
}

function StateShell({ icon: Icon, title, description, action, role, iconClassName }: StateShellProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/90 bg-card/70 px-8 py-14 text-center shadow-[inset_0_1px_0_oklch(1_0_0_/_0.6)]"
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary">
        <Icon className={cn("size-6 text-muted-foreground", iconClassName)} aria-hidden />
      </span>
      <p className="font-heading text-lg font-medium tracking-tight text-primary">{title}</p>
      {description ? <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Lista/consulta sem resultados. */
export function EmptyState(props: { title: string; description?: string; action?: ReactNode }) {
  return <StateShell icon={Inbox} role="status" {...props} />;
}

/** Falha ao carregar ou processar; role=alert anuncia o erro a leitores de tela. */
export function ErrorState({ title = "Não foi possível carregar os dados", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return <StateShell icon={AlertCircle} role="alert" iconClassName="text-destructive" title={title} description={description} action={action} />;
}

export function LoadingState({ title = "Carregando…" }: { title?: string }) {
  return (
    <div role="status" aria-label={title} className="space-y-4">
      <p className="sr-only">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <div key={key} className="surface-card h-28 overflow-hidden">
            <div className="h-full animate-pulse bg-gradient-to-r from-muted/40 via-muted/80 to-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Usuário autenticado, porém sem permissão para o recurso. */
export function ForbiddenState({ description = "Você não tem permissão para acessar este conteúdo." }: { description?: string }) {
  return <StateShell icon={ShieldAlert} role="alert" title="Acesso negado" description={description} />;
}

/** Honestidade de dados: a fonte (banco) ainda não está configurada; nenhum número é inventado. */
export function DataSourceUnavailableState({ description }: { description?: string }) {
  return (
    <StateShell
      icon={DatabaseZap}
      role="status"
      title="Fonte de dados não configurada"
      description={description ?? "Esta área exibirá os dados reais assim que a integração com o banco de dados for configurada. Nenhum valor é simulado."}
    />
  );
}
