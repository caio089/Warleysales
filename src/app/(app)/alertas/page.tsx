import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { markNotificationReadFormAction } from "@/modules/notifications/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { EmptyState, LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { formatDateTimeFortaleza } from "@/shared/lib/time";

export const metadata: Metadata = { title: "Alertas" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.notifications.listMine(actor));
  return (
    <Screen result={result}>
      {({ items, unread }) => items.length === 0 ? <EmptyState title="Nenhum alerta" description="Você será avisado nos marcos de 90, 60, 30, 15, 7 e 0 dias do vencimento de atas e contratos." /> : (
        <section aria-label="Notificações">
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">{unread} não lida(s)</p>
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className="surface-card flex items-start justify-between gap-4 p-5">
                <div><p className={n.readAt ? "text-sm" : "text-sm font-semibold"}>{n.title}</p><p className="text-sm text-muted-foreground">{n.body}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTimeFortaleza(n.createdAt)}</p></div>
                {n.readAt ? null : <ActionForm action={markNotificationReadFormAction} submitLabel="Marcar como lida" submitVariant="outline" hiddenFields={{ notificationId: n.id }}>{() => null}</ActionForm>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </Screen>
  );
}

export default function AlertsPage() {
  return (<><PageHeader title="Alertas" description="Notificações internas de vencimento." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
