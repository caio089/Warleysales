import { AlertCircle, DatabaseZap, Inbox, Loader2, ShieldAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StateShellProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  role?: "status" | "alert";
  iconClassName?: string;
  spin?: boolean;
}

function StateShell({ icon: Icon, title, description, action, role, iconClassName, spin }: StateShellProps) {
  return (
    <div role={role} className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <Icon className={cn("size-8 text-muted-foreground", spin && "animate-spin", iconClassName)} aria-hidden />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action}
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
  return <StateShell icon={Loader2} role="status" spin title={title} />;
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
