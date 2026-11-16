import type { Metadata } from "next";
import { Suspense } from "react";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import { markNotificationReadFormAction } from "@/modules/notifications/actions";
import { loadScreen } from "@/server/screen";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { EmptyState, LoadingState } from "@/shared/ui/feedback-states";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { KpiCard } from "@/shared/ui/kpi-card";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";

export const metadata: Metadata = { title: "Alertas" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.notifications.listMine(actor));
  return (
    <Screen result={result}>
      {({ items, unread }) => {
        const pending = items.filter((item) => !item.readAt);
        const read = items.filter((item) => Boolean(item.readAt));
        return (
          <>
            <PageHeader eyebrow="Acompanhamento · Prazos" title="Alertas" description="Acompanhe os avisos de vencimento de contratos e atas. Os avisos não lidos aparecem primeiro." />
            <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Resumo dos alertas">
              <KpiCard icon={<Bell className="size-4" aria-hidden />} label="Total" value={items.length} />
              <KpiCard icon={<BellRing className="size-4" aria-hidden />} label="Não lidos" value={unread} accent={unread > 0} />
              <KpiCard icon={<CheckCheck className="size-4" aria-hidden />} label="Lidos" value={read.length} />
            </div>
            <Suspense fallback={<ModuleInsightFallback />}>
              <ModuleInsight moduleName="Alertas" sourceHref="/alertas" facts={[{ label: "Total", value: items.length }, { label: "Não lidos", value: unread }]} />
            </Suspense>
            {items.length === 0 ? (
              <div className="mt-6"><EmptyState title="Nenhum alerta" description="Você será avisado nos marcos de 90, 60, 30, 15, 7 e 0 dias do vencimento de atas e contratos." /></div>
            ) : (
              <div className="mt-8 space-y-8">
                {pending.length > 0 ? (
                  <section aria-label="Alertas não lidos">
                    <div className="mb-3 flex items-center justify-between"><SectionLabel>Precisam de atenção</SectionLabel><span className="rounded-full bg-warning px-2.5 py-1 text-xs font-semibold text-warning-foreground">{pending.length} não lido{pending.length === 1 ? "" : "s"}</span></div>
                    <ul className="space-y-3">
                      {pending.map((item) => (
                        <li key={item.id} className="surface-card flex flex-col gap-4 border-l-4 border-l-highlight p-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0"><p className="font-semibold text-primary">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p><p className="mt-2 text-xs text-muted-foreground">{formatDateTimeFortaleza(item.createdAt)}</p></div>
                          <ActionForm action={markNotificationReadFormAction} submitLabel="Marcar como lido" submitVariant="outline" hiddenFields={{ notificationId: item.id }}>{() => null}</ActionForm>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {read.length > 0 ? (
                  <section aria-label="Alertas lidos">
                    <div className="mb-3"><SectionLabel>Já consultados</SectionLabel></div>
                    <ul className="space-y-3">
                      {read.map((item) => <li key={item.id} className="surface-card p-5"><p className="font-medium text-primary">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p><p className="mt-2 text-xs text-muted-foreground">{formatDateTimeFortaleza(item.createdAt)}</p></li>)}
                    </ul>
                  </section>
                ) : null}
              </div>
            )}
          </>
        );
      }}
    </Screen>
  );
}

export default function AlertsPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
