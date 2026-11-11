import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { DOCUMENT_TYPE_CODES, DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import { can } from "@/shared/lib/authz/policy";
import { loadLookups } from "@/server/lookups";
import { formatCurrency } from "@/shared/lib/format";
import { formatDateOnly } from "@/shared/lib/time";
import { processNextStep } from "@/shared/ui/flow-copy";
import { NextStepCallout } from "@/shared/ui/flow-guide";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { COMPLETION_STATUS, PROCESS_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { AdditionalDocumentsCard, DocumentCard } from "./document-card";
import { FormalizationCard } from "./formalization-card";
import { ProcessActions } from "./process-actions";

export const metadata: Metadata = { title: "Processo" };

async function ProcessContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const view = await services.processes.get(actor, id);
    if (!view.ok) return view;
    const documents = await services.documents.listByProcess(actor, id);
    const formalization = await services.formalizations.getByProcess(actor, id);
    const suppliers = await services.suppliers.list(actor);
    const [purchaseRequests, atas, contracts] = await Promise.all([
      services.purchases.list(actor),
      services.atas.list(actor),
      services.contracts.list(actor),
    ]);
    const lookups = await loadLookups({ services, actor });
    const linkedRequest = purchaseRequests.ok
      ? purchaseRequests.data.find((r) => r.processId === id) ?? null
      : null;
    const materialName = lookups.ok ? lookups.data.materialName : {};
    const councilId = view.data.process.councilId;
    return ok({
      view: view.data,
      documents: documents.ok ? documents.data : [],
      formalization: formalization.ok ? formalization.data : null,
      suppliers: suppliers.ok ? suppliers.data : [],
      canManage: can(actor, "process.create", councilId),
      canUnlink: can(actor, "document.unlink", councilId),
      canRegisterClosing: can(actor, "retention.manage", councilId),
      isSpecialDeleter: actor.isSpecialDeleter,
      isWarley: actor.isCentralAdmin,
      defaultEstimatedValue: linkedRequest?.estimatedValue ?? null,
      requestId: linkedRequest?.id ?? null,
      requestItems: (linkedRequest?.items ?? []).map((item) => ({
        materialId: item.materialId,
        name: materialName[item.materialId] ?? "Item",
        quantity: item.quantity,
      })),
      linkedAtas: atas.ok ? atas.data.filter((item) => item.ata.processId === id).map((item) => ({
        id: item.ata.id,
        number: item.ata.number,
        endDate: item.endDate,
        status: item.validity === "vigente" ? "Vigente" : "Vencida",
      })) : [],
      linkedContracts: contracts.ok ? contracts.data.filter((item) => item.contract.processId === id).map((item) => ({
        id: item.contract.id,
        number: item.contract.number,
        object: item.contract.object,
        value: item.terms.value,
        endDate: item.terms.endDate,
      })) : [],
    });
  });
  return (
    <Screen result={result}>
      {({
        view,
        documents,
        formalization,
        suppliers,
        canManage,
        canUnlink,
        canRegisterClosing,
        isSpecialDeleter,
        isWarley,
        defaultEstimatedValue,
        requestId,
        requestItems,
        linkedAtas,
        linkedContracts,
      }) => {
        const status = presentationOf(PROCESS_STATUS, view.process.status);
        const completion = presentationOf(COMPLETION_STATUS, view.completion);
        const typesCount = view.process.snapshot ? DOCUMENT_TYPES.length : view.progress.validTypes.length;
        const additionalDocs = documents.filter(
          (d) => !(DOCUMENT_TYPE_CODES as readonly string[]).includes(d.typeCode) && d.linkStatus === "active",
        );
        const productName = requestItems.length === 1 ? requestItems[0]!.name : view.process.title;
        const quantity = requestItems.reduce((total, item) => total + item.quantity, 0);
        const initialValue = defaultEstimatedValue ?? formalization?.estimatedValue ?? null;
        const documentsReady = view.progress.isComplete;
        const readyToRelease = documentsReady && linkedAtas.length > 0 && linkedContracts.length > 0 && initialValue != null;
        const next = processNextStep({
          completion: view.completion,
          typesDone: typesCount,
          typesTotal: DOCUMENT_TYPES.length,
          canUpload: canManage,
          status: view.process.status,
          awaitingContract: view.progress.isComplete && !formalization,
        });
        return (
          <>
            <div className="mb-4 flex flex-wrap gap-4">
              <Link
                href="/processos"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                <span>Voltar para Processos</span>
              </Link>
              <Link
                href="/estoque"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                <span>Voltar para o estoque</span>
              </Link>
            </div>
            <PageHeader
              eyebrow={`Processo ${view.process.number}`}
              title={productName}
              description={view.process.title}
              actions={
                <>
                  <StatusBadge label={status.label} tone={status.tone} />
                  <StatusBadge label={completion.label} tone={completion.tone} />
                </>
              }
            />
            <section aria-label="Resumo do produto" className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="surface-card p-4">
                <p className="text-xs text-muted-foreground">Valor inicial</p>
                <p className="mt-1 text-lg font-semibold">{initialValue != null ? formatCurrency(initialValue) : "Não informado"}</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs text-muted-foreground">Quantidade</p>
                <p className="mt-1 text-lg font-semibold">{quantity > 0 ? quantity : "—"}</p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs text-muted-foreground">Para liberar</p>
                <p className="mt-1 text-sm font-medium">{formalization?.status === "homologado" ? "Produto disponível" : readyToRelease ? "Falta gravar a contratação" : "Ainda faltam itens da pasta"}</p>
              </div>
            </section>
            <NextStepCallout {...next} />
            <ProcessActions
              processId={view.process.id}
              status={view.process.status}
              canChangeStatus={canManage}
              canRegisterClosing={canRegisterClosing}
              closingReportRegistered={view.process.closingReportRegistered}
              documentalComplete={view.completion === "completa"}
            />
            <section aria-label="Progresso documental" className="surface-card mb-6 p-5">
              <p className="mb-2 text-sm font-medium">
                Documentos anexados ({typesCount}/{DOCUMENT_TYPES.length}
                {view.process.snapshot ? ", snapshot após limpeza" : ""})
              </p>
              <ProgressBar value={view.displayPercent} label="Progresso documental" />
              <p className="mt-2 text-xs text-muted-foreground">
                Sobe sozinho quando cada tipo recebe um anexo válido. Completar os 7 documentos não conclui o processo —
                isso é a situação administrativa (bloco acima).
              </p>
            </section>
            <section aria-label="Documentos obrigatórios" className="space-y-3">
              <div>
                <h2 className="font-heading text-lg font-medium tracking-tight text-primary">Os 7 documentos</h2>
                <p className="text-sm text-muted-foreground">
                  Em cada card, envie o arquivo do tipo indicado. Ordem sugerida: DFD → ETP → MR → TR → PP → PJ → ED.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {DOCUMENT_TYPES.map((type, index) => (
                  <DocumentCard
                    key={type.code}
                    processId={view.process.id}
                    typeCode={type.code}
                    label={`${index + 1}. ${type.label}`}
                    valid={view.progress.validTypes.includes(type.code)}
                    files={documents
                      .filter((d) => d.typeCode === type.code && d.linkStatus === "active")
                      .map((d) => ({ id: d.id, name: d.fileName }))}
                    canUpload={canManage}
                    canUnlink={canUnlink}
                    canManualDelete={isSpecialDeleter}
                  />
                ))}
              </div>
            </section>
            <section aria-label="Artefatos adicionais" className="mt-8 space-y-3">
              <div>
                <h2 className="font-heading text-lg font-medium tracking-tight text-primary">
                  Artefatos Adicionais & Complementares
                </h2>
                <p className="text-sm text-muted-foreground">
                  Documentos complementares, minutas, laudos e pareceres que não alteram a régua dos 7 obrigatórios da Lei 14.133.
                </p>
              </div>
              <AdditionalDocumentsCard
                processId={view.process.id}
                docs={additionalDocs.map((d) => ({
                  id: d.id,
                  name: d.fileName,
                  size: d.size,
                  createdAt: d.createdAt,
                }))}
                canUpload={canManage}
                canUnlink={canUnlink}
                canManualDelete={isSpecialDeleter}
              />
            </section>
            <section aria-label="Atas e contratos" className="surface-card mt-8 mb-6 p-5">
              <h2 className="font-heading text-lg font-medium tracking-tight text-primary">Atas e contratos anexados</h2>
              <p className="mt-1 text-sm text-muted-foreground">Os dois precisam estar ligados a este processo antes da liberação do produto.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Atas</p>
                  {linkedAtas.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-sm">
                      {linkedAtas.map((ata) => (
                        <li key={ata.id}>
                          <Link href={`/atas/${ata.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{ata.number}</Link>
                          <p className="text-xs text-muted-foreground">{ata.status} · vigência até {formatDateOnly(ata.endDate)}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-2 text-sm text-muted-foreground">Nenhuma ata vinculada. Abra a ata e escolha este processo.</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Contratos</p>
                  {linkedContracts.length > 0 ? (
                    <ul className="mt-2 space-y-2 text-sm">
                      {linkedContracts.map((contract) => (
                        <li key={contract.id}>
                          <Link href={`/contratos/${contract.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{contract.number}</Link>
                          <p className="text-xs text-muted-foreground">{contract.object} · {formatCurrency(contract.value)} · até {formatDateOnly(contract.endDate)}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-2 text-sm text-muted-foreground">Nenhum contrato vinculado. Abra o contrato e escolha este processo.</p>}
                </div>
              </div>
            </section>
            <section aria-label="O que falta para liberar" className="surface-card mb-6 p-5">
              <h2 className="font-heading text-lg font-medium tracking-tight text-primary">Para liberar o produto</h2>
              <ul className="mt-3 space-y-1 text-sm">
                <li>{documentsReady ? "Documentos completos." : `Documentos pendentes (${typesCount}/${DOCUMENT_TYPES.length}).`}</li>
                <li>{initialValue != null ? `Valor inicial de ${formatCurrency(initialValue)}.` : "Valor inicial ainda não informado."}</li>
                <li>{linkedAtas.length > 0 ? "Ata vinculada." : "Falta vincular a ata."}</li>
                <li>{linkedContracts.length > 0 ? "Contrato vinculado." : "Falta vincular o contrato."}</li>
                <li>{formalization?.status === "homologado" ? "Estoque liberado." : "No final, informe fornecedor, data do pregão, quantidade e valor comprado."}</li>
              </ul>
            </section>
            <FormalizationCard
              processId={view.process.id}
              councilId={view.process.councilId}
              documentalComplete={view.progress.isComplete}
              formalization={formalization}
              suppliers={suppliers}
              isWarley={isWarley}
              defaultEstimatedValue={initialValue}
              requestId={requestId}
              requestItems={requestItems}
            />
          </>
        );
      }}
    </Screen>
  );
}

export default function ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProcessContent params={params} />
    </Suspense>
  );
}
