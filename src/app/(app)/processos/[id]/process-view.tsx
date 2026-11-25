"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ClipboardCheck, FolderKanban, Handshake, History, ShieldCheck } from "lucide-react";
import { DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import { needsAta } from "@/modules/processes/contracting-mode";
import Link from "next/link";
import type { Attachment } from "@/modules/documents/schemas";
import type { ProcessAttachment } from "@/modules/processes/domain/progress";
import type { ProcessView as ProcessServiceView } from "@/modules/processes/service";
import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";
import {
  COMPLETION_STATUS,
  PROCESS_STATUS,
  presentationOf,
  processDisplayStatus,
} from "@/shared/ui/status-presentation";
import type { FormalizationSupplier } from "./formalization-card";
import { PlanDossierCard } from "@/app/(app)/solicitacoes/plan-dossier-card";
import { planDossier } from "@/app/(app)/solicitacoes/request-facets";
import type { TimelineEntry } from "@/shared/ui/activity-timeline";
import { ProcessHeader } from "./process-header";
import {
  ApprovalsTab,
  type ApprovalsTabRequest,
} from "./tabs/approvals-tab";
import {
  ContractingTab,
  type LinkedAtaItem,
  type LinkedContractItem,
} from "./tabs/contracting-tab";
import {
  DocumentationTab,
  type DocumentationTabDocument,
} from "./tabs/documentation-tab";
import { GovernanceTab } from "./tabs/governance-tab";
import { HistoryTab } from "./tabs/history-tab";

export type ProcessTabId =
  | "aprovacoes"
  | "documentos"
  | "contratacao"
  | "governanca"
  | "historico";

const PROCESS_TAB_IDS: readonly ProcessTabId[] = [
  "aprovacoes",
  "documentos",
  "contratacao",
  "governanca",
  "historico",
];

export function processTabFromSearch(search: string, fallback: ProcessTabId = "documentos"): ProcessTabId {
  const value = new URLSearchParams(search).get("aba");
  return PROCESS_TAB_IDS.includes(value as ProcessTabId) ? (value as ProcessTabId) : fallback;
}

export interface ProcessViewProps {
  view: ProcessServiceView;
  documents: (Attachment | ProcessAttachment | DocumentationTabDocument)[];
  formalization: ProcessFormalization | null;
  suppliers: FormalizationSupplier[];
  canManage: boolean;
  canUnlink: boolean;
  canRegisterClosing: boolean;
  isWarley: boolean;
  defaultEstimatedValue: number | null;
  requestId: string | null;
  requestItems: Array<{ materialId: string; name: string; quantity: number }>;
  requestNotes?: string[];
  history?: TimelineEntry[];
  approvalRequest?: ApprovalsTabRequest | null;
  linkedAtas: LinkedAtaItem[];
  linkedContracts: LinkedContractItem[];
  availableAtas?: { value: string; label: string }[];
  availableContracts?: { value: string; label: string }[];
  instrumentDraft?: {
    councilLabel: string;
    processLabel: string;
    processNumber: string;
    materials: { value: string; label: string }[];
    requestMaterials: { materialId: string; name: string; quantity: number }[];
    defaultValue?: number | null;
    validityStartDate?: string | null;
    suppliers: { value: string; label: string; cnpj: string | null }[];
  };
  initialTab?: ProcessTabId;
}

interface TabDefinition {
  id: ProcessTabId;
  label: string;
  icon: typeof FolderKanban;
  badge?: string;
}

/** Visualização do processo em abas: aprovações, documentação, contratação, governança e histórico. */
export function ProcessView({
  view,
  documents,
  formalization,
  suppliers,
  canManage,
  canUnlink,
  canRegisterClosing,
  isWarley,
  defaultEstimatedValue,
  requestId,
  requestItems,
  requestNotes = [],
  history = [],
  approvalRequest = null,
  linkedAtas,
  linkedContracts,
  availableAtas = [],
  availableContracts = [],
  instrumentDraft,
  initialTab = "documentos",
}: ProcessViewProps) {
  const [activeTab, setActiveTab] = useState<ProcessTabId>(initialTab);
  const tabRefs = useRef(new Map<ProcessTabId, HTMLButtonElement>());

  useEffect(() => {
    const syncTabFromUrl = () => {
      setActiveTab(processTabFromSearch(window.location.search));
    };
    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  function selectTab(tab: ProcessTabId) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (url.searchParams.get("aba") !== tab) {
      url.searchParams.set("aba", tab);
      window.history.pushState(null, "", url);
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: ProcessTabId) {
    const index = tabs.findIndex((tab) => tab.id === current);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex]!.id;
    selectTab(nextTab);
    tabRefs.current.get(nextTab)?.focus();
  }

  // Métricas e dados derivados para o ProcessHeader
  const status = presentationOf(
    PROCESS_STATUS,
    processDisplayStatus(view.process.status, approvalRequest?.status),
  );
  const completion = presentationOf(COMPLETION_STATUS, view.completion);
  const typesCount = view.process.snapshot
    ? DOCUMENT_TYPES.length
    : view.progress.validTypes.length;
  const totalTypesCount = DOCUMENT_TYPES.length;
  const productName =
    requestItems.length === 1 ? requestItems[0]!.name : view.process.title;
  const quantity = requestItems.reduce((total, item) => total + item.quantity, 0);
  const initialValue =
    defaultEstimatedValue ?? view.process.estimatedValue ?? formalization?.estimatedValue ?? null;
  const dossier = planDossier(requestNotes, initialValue, productName);
  const planSummary = dossier.itemNumber
    ? `Item ${dossier.itemNumber} do PCA. ${dossier.contractingForm}. Concluir em ${dossier.plannedMonth}. Vencimento atual: ${dossier.expiry?.raw ?? "não informado"}.`
    : "";
  const documentsReady = view.progress.isComplete;
  const ataRequired = needsAta(view.process.contractingMode);
  const readyToRelease =
    documentsReady &&
    (!ataRequired || linkedAtas.length > 0) &&
    linkedContracts.length > 0 &&
    initialValue != null;
  const releaseStatusText =
    formalization?.status === "homologado"
      ? "Produto disponível"
      : readyToRelease
        ? "Falta gravar a contratação"
        : "Ainda faltam itens da pasta";

  const totalLinkedInstruments = linkedAtas.length + linkedContracts.length;

  const approvalPending =
    approvalRequest != null &&
    ["enviada", "em_analise", "aguardando_correcao"].includes(approvalRequest.status);

  /** Documentação e instrumentos só liberam depois da aprovação (ou se não houver solicitação). */
  const workUnlocked =
    approvalRequest == null ||
    ["aprovada", "em_atendimento", "parcialmente_atendida", "atendida"].includes(approvalRequest.status);
  const canManageDocs = canManage && workUnlocked;
  const canLinkInstruments = canManage && workUnlocked;

  const tabs: TabDefinition[] = [
    {
      id: "aprovacoes",
      label: "Aprovações",
      icon: ClipboardCheck,
      badge: approvalPending ? "1" : undefined,
    },
    {
      id: "documentos",
      label: "Documentação (7+N)",
      icon: FolderKanban,
      badge: `${typesCount}/${totalTypesCount}`,
    },
    {
      id: "contratacao",
      label: "Atas e contratos",
      icon: Handshake,
      badge: totalLinkedInstruments > 0 ? String(totalLinkedInstruments) : undefined,
    },
    {
      id: "governanca",
      label: "Governança",
      icon: ShieldCheck,
    },
    {
      id: "historico",
      label: "Histórico",
      icon: History,
      badge: history.length > 0 ? String(history.length) : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Topo Executivo com Métricas Rápidas */}
      <ProcessHeader
        processNumber={view.process.number}
        productName={productName}
        description={planSummary || (productName !== view.process.title ? view.process.title : "")}
        statusLabel={status.label}
        statusTone={status.tone}
        completionLabel={completion.label}
        completionTone={completion.tone}
        initialValue={initialValue}
        quantity={quantity}
        validTypesCount={typesCount}
        totalTypesCount={totalTypesCount}
        displayPercent={view.displayPercent}
        releaseStatusText={releaseStatusText}
      />

      <PlanDossierCard dossier={dossier} objectText={productName} />
      {requestId && canManage ? <Link href={`/solicitacoes/${requestId}`} className="inline-flex rounded-md border px-4 py-2 text-sm font-medium">Corrigir solicitação vinculada</Link> : null}

      {/* 2. Barra de Navegação por Abas */}
      <nav
        aria-label="Navegação por abas do processo"
        className="border-b border-border/70"
      >
        <div
          role="tablist"
          aria-label="Abas do processo"
          className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                ref={(element) => {
                  if (element) tabRefs.current.set(tab.id, element);
                  else tabRefs.current.delete(tab.id);
                }}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                className={`group inline-flex items-center gap-2 border-b-2 px-3.5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 transition-colors ${
                    isSelected
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
                {tab.badge != null ? (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Painéis de Conteúdo das Abas */}
      <main>
        <div
          role="tabpanel"
          id="panel-aprovacoes"
          aria-labelledby="tab-aprovacoes"
          hidden={activeTab !== "aprovacoes"}
          tabIndex={0}
        >
          {activeTab === "aprovacoes" ? (
            <ApprovalsTab request={approvalRequest} processId={view.process.id} />
          ) : null}
        </div>

        <div
          role="tabpanel"
          id="panel-documentos"
          aria-labelledby="tab-documentos"
          hidden={activeTab !== "documentos"}
          tabIndex={0}
        >
          {activeTab === "documentos" && (
            <>
              {!workUnlocked ? (
                <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
                  Documentação bloqueada até a solicitação ser aprovada na aba Aprovações.
                </div>
              ) : null}
              <DocumentationTab
                estimatedValue={initialValue}
                canEditEstimatedValue={canManageDocs && !view.process.snapshot && !["cancelado", "arquivado"].includes(view.process.status)}
                validityStartDate={view.process.validityStartDate ?? null}
                canEditValidityStart={canManageDocs && !view.process.snapshot && !["cancelado", "arquivado"].includes(view.process.status)}
                contractingMode={view.process.contractingMode ?? null}
                canEditContractingMode={canManageDocs && !view.process.snapshot && !["cancelado", "arquivado"].includes(view.process.status)}
                processId={view.process.id}
                documentExceptions={view.process.documentExceptions}
                validTypes={view.progress.validTypes}
                documents={documents}
                canManage={canManageDocs}
                canUnlink={canUnlink && workUnlocked}
              />
            </>
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-contratacao"
          aria-labelledby="tab-contratacao"
          hidden={activeTab !== "contratacao"}
          tabIndex={0}
        >
          {activeTab === "contratacao" && (
            <ContractingTab
              processId={view.process.id}
              councilId={view.process.councilId}
              documentalComplete={view.progress.isComplete}
              formalization={formalization}
              evidenceOptions={documents.flatMap((document) =>
                "id" in document && document.id && "fileName" in document && document.fileName &&
                  document.uploadStatus === "confirmed" && document.linkStatus === "active"
                  ? [{ id: document.id, name: document.fileName }]
                  : [],
              )}
              suppliers={suppliers}
              isWarley={isWarley}
              defaultEstimatedValue={initialValue}
              requestId={requestId}
              requestItems={requestItems}
              linkedAtas={linkedAtas}
              linkedContracts={linkedContracts}
              availableAtas={availableAtas}
              availableContracts={availableContracts}
              canLink={canLinkInstruments}
              draft={instrumentDraft}
              contractingMode={view.process.contractingMode ?? null}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-governanca"
          aria-labelledby="tab-governanca"
          hidden={activeTab !== "governanca"}
          tabIndex={0}
        >
          {activeTab === "governanca" && (
            <GovernanceTab
              processId={view.process.id}
              status={view.process.status}
              canChangeStatus={canManage}
              canRegisterClosing={canRegisterClosing}
              closingReportRegistered={view.process.closingReportRegistered}
              documentalComplete={view.progress.isComplete}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-historico"
          aria-labelledby="tab-historico"
          hidden={activeTab !== "historico"}
          tabIndex={0}
        >
          {activeTab === "historico" && <HistoryTab history={history} />}
        </div>
      </main>
    </div>
  );
}
