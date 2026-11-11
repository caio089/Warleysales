"use client";

import { useState } from "react";
import { FolderKanban, Handshake, ShieldCheck } from "lucide-react";
import { DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import type { Attachment } from "@/modules/documents/schemas";
import type { ProcessAttachment } from "@/modules/processes/domain/progress";
import type { ProcessView as ProcessServiceView } from "@/modules/processes/service";
import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";
import {
  COMPLETION_STATUS,
  PROCESS_STATUS,
  presentationOf,
} from "@/shared/ui/status-presentation";
import type { FormalizationSupplier } from "./formalization-card";
import { ProcessHeader } from "./process-header";
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

export type ProcessTabId = "documentos" | "contratacao" | "governanca";

export interface ProcessViewProps {
  view: ProcessServiceView;
  documents: (Attachment | ProcessAttachment | DocumentationTabDocument)[];
  formalization: ProcessFormalization | null;
  suppliers: FormalizationSupplier[];
  canManage: boolean;
  canUnlink: boolean;
  canRegisterClosing: boolean;
  isSpecialDeleter: boolean;
  isWarley: boolean;
  defaultEstimatedValue: number | null;
  requestId: string | null;
  requestItems: Array<{ materialId: string; name: string; quantity: number }>;
  linkedAtas: LinkedAtaItem[];
  linkedContracts: LinkedContractItem[];
  initialTab?: ProcessTabId;
}

interface TabDefinition {
  id: ProcessTabId;
  label: string;
  icon: typeof FolderKanban;
  badge?: string;
}

/**
 * Componente principal da visualização de processos em abas executivas.
 * Unifica cabeçalho com 4 métricas rápidas e 3 abas focadas:
 * 1. Documentação (7+N)
 * 2. Contratação & Atas
 * 3. Governança & Histórico
 */
export function ProcessView({
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
  initialTab = "documentos",
}: ProcessViewProps) {
  const [activeTab, setActiveTab] = useState<ProcessTabId>(initialTab);

  // Métricas e dados derivados para o ProcessHeader
  const status = presentationOf(PROCESS_STATUS, view.process.status);
  const completion = presentationOf(COMPLETION_STATUS, view.completion);
  const typesCount = view.process.snapshot
    ? DOCUMENT_TYPES.length
    : view.progress.validTypes.length;
  const totalTypesCount = DOCUMENT_TYPES.length;
  const productName =
    requestItems.length === 1 ? requestItems[0]!.name : view.process.title;
  const quantity = requestItems.reduce((total, item) => total + item.quantity, 0);
  const initialValue =
    defaultEstimatedValue ?? formalization?.estimatedValue ?? null;
  const documentsReady = view.progress.isComplete;
  const readyToRelease =
    documentsReady &&
    linkedAtas.length > 0 &&
    linkedContracts.length > 0 &&
    initialValue != null;
  const releaseStatusText =
    formalization?.status === "homologado"
      ? "Produto disponível"
      : readyToRelease
        ? "Falta gravar a contratação"
        : "Ainda faltam itens da pasta";

  const totalLinkedInstruments = linkedAtas.length + linkedContracts.length;

  const tabs: TabDefinition[] = [
    {
      id: "documentos",
      label: "Documentação (7+N)",
      icon: FolderKanban,
      badge: `${typesCount}/${totalTypesCount}`,
    },
    {
      id: "contratacao",
      label: "Contratação & Atas",
      icon: Handshake,
      badge: totalLinkedInstruments > 0 ? String(totalLinkedInstruments) : undefined,
    },
    {
      id: "governanca",
      label: "Governança & Histórico",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Topo Executivo com Métricas Rápidas */}
      <ProcessHeader
        processNumber={view.process.number}
        productName={productName}
        description={productName !== view.process.title ? view.process.title : ""}
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
                onClick={() => setActiveTab(tab.id)}
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
        {/* Aba 1: Pasta Documental */}
        <div
          role="tabpanel"
          id="panel-documentos"
          aria-labelledby="tab-documentos"
          hidden={activeTab !== "documentos"}
          tabIndex={0}
        >
          {activeTab === "documentos" && (
            <DocumentationTab
              processId={view.process.id}
              validTypes={view.progress.validTypes}
              documents={documents}
              canManage={canManage}
              canUnlink={canUnlink}
              isSpecialDeleter={isSpecialDeleter}
            />
          )}
        </div>

        {/* Aba 2: Contratação & Atas */}
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
              suppliers={suppliers}
              isWarley={isWarley}
              defaultEstimatedValue={initialValue}
              requestId={requestId}
              requestItems={requestItems}
              linkedAtas={linkedAtas}
              linkedContracts={linkedContracts}
            />
          )}
        </div>

        {/* Aba 3: Governança & Histórico */}
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
      </main>
    </div>
  );
}
