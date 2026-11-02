import type { Metadata } from "next";
import { Suspense } from "react";
import { MessageCircle } from "lucide-react";
import { formatWhatsapp, whatsappHref } from "@/modules/identity/domain/whatsapp";
import { loadScreen } from "@/server/screen";
import { can } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { EditCouncilForm } from "../new-council-form";

export const metadata: Metadata = { title: "Conselho" };

async function CouncilContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const council = await services.councils.get(actor, id);
    if (!council.ok) return council;
    const processes = await services.processes.list(actor);
    const mine = processes.ok ? processes.data.filter((p) => p.process.councilId === id) : [];
    return ok({
      council: council.data,
      processTotal: mine.length,
      processCompleted: mine.filter((p) => p.completion === "completa").length,
      canManage: can(actor, "council.manage"),
    });
  });
  return (
    <Screen result={result}>
      {({ council, processTotal, processCompleted, canManage }) => (
        <div className="space-y-8">
          <PageHeader title={`${council.acronym} — ${council.name}`} description={council.institutionalInfo ?? undefined} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Processos do conselho" value={processTotal} />
            <KpiCard label="Documentação completa" value={processCompleted} />
            <KpiCard label="Situação" value={council.active ? "Ativo" : "Inativo"} />
            <KpiCard label="WhatsApp" value={council.whatsappE164 ? formatWhatsapp(council.whatsappE164) : null} />
          </div>
          <section className="surface-card p-5" aria-label="Contato WhatsApp">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <MessageCircle className="size-4" aria-hidden />
              </span>
              <h2 className="font-heading text-lg font-medium tracking-tight text-primary">WhatsApp</h2>
            </div>
            {council.whatsappE164 ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Número gravado: <span className="font-medium text-primary">{formatWhatsapp(council.whatsappE164)}</span>.{" "}
                <a
                  href={whatsappHref(council.whatsappE164)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:text-highlight hover:underline"
                >
                  Abrir conversa
                </a>
                . O envio em lote pelo sistema ainda não está ligado; o número já fica disponível para quando você quiser mandar.
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nenhum WhatsApp cadastrado neste conselho. Informe o celular com DDD no cadastro ou na edição.
              </p>
            )}
          </section>
          {canManage ? (
            <section aria-labelledby="editar-conselho" className="surface-card max-w-lg p-6">
              <h2 id="editar-conselho" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Editar conselho</h2>
              <EditCouncilForm council={council} />
            </section>
          ) : null}
        </div>
      )}
    </Screen>
  );
}

export default function CouncilPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><CouncilContent params={params} /></Suspense>;
}
