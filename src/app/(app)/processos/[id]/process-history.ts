import { ALL_DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import type { TimelineEntry } from "@/shared/ui/activity-timeline";

export interface ProcessHistoryInput {
  process: {
    number: string;
    createdAt: string;
    documentalCompletedAt?: string | null;
  };
  request?: {
    title: string;
    createdAt: string;
    events: { to: string; at: string; note?: string | null }[];
  } | null;
  documents: {
    id?: string;
    typeCode: string;
    fileName?: string;
    name?: string;
    createdAt?: string | null;
    linkStatus?: string;
  }[];
  formalization?: {
    createdAt: string;
    status: string;
    homologatedAt?: string | null;
    homologationNote?: string | null;
    auctionDate?: string | null;
  } | null;
}

const DOCUMENT_LABEL = Object.fromEntries(
  ALL_DOCUMENT_TYPES.map((type) => [type.code, type.label]),
) as Record<string, string>;

const REQUEST_EVENT_TITLE: Record<string, string> = {
  rascunho: "Solicitação criada (rascunho)",
  enviada: "Solicitação enviada para aprovação",
  em_analise: "Solicitação em análise",
  aguardando_correcao: "Correção solicitada na solicitação",
  aprovada: "Solicitação aprovada",
  rejeitada: "Solicitação rejeitada",
  em_atendimento: "Recebimento iniciado",
  parcialmente_atendida: "Recebimento parcial registrado",
  atendida: "Solicitação atendida",
  cancelada: "Solicitação cancelada",
};

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function documentTypeLabel(typeCode: string): string {
  return DOCUMENT_LABEL[typeCode] ?? typeCode;
}

/** Monta a linha do tempo do processo: envio, cada documento colocado, formalização. */
export function buildProcessHistory(input: ProcessHistoryInput): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  const processCreated = toIso(input.process.createdAt);
  if (processCreated) {
    entries.push({
      id: "process-created",
      title: "Processo criado",
      description: `Processo ${input.process.number}`,
      occurredAt: processCreated,
    });
  }

  if (input.request) {
    const requestCreated = toIso(input.request.createdAt);
    if (requestCreated) {
      entries.push({
        id: "request-created",
        title: "Solicitação registrada",
        description: input.request.title,
        occurredAt: requestCreated,
      });
    }
    input.request.events.forEach((event, index) => {
      const at = toIso(event.at);
      if (!at) return;
      // Evita duplicar "registrada" quando o primeiro evento já é rascunho na mesma hora.
      if (event.to === "rascunho" && requestCreated && Math.abs(Date.parse(at) - Date.parse(requestCreated)) < 2000) {
        return;
      }
      entries.push({
        id: `request-event-${index}`,
        title: REQUEST_EVENT_TITLE[event.to] ?? `Solicitação: ${event.to}`,
        description: event.note?.trim() || input.request?.title,
        occurredAt: at,
      });
    });
  }

  input.documents.forEach((document, index) => {
    const at = toIso(document.createdAt);
    if (!at) return;
    const typeLabel = documentTypeLabel(document.typeCode);
    const fileName = document.fileName ?? document.name;
    entries.push({
      id: `document-${document.id ?? index}`,
      title: `${document.typeCode} colocado`,
      description: fileName ? `${typeLabel} · ${fileName}` : typeLabel,
      occurredAt: at,
    });
  });

  if (input.formalization) {
    const created = toIso(input.formalization.createdAt);
    if (created) {
      entries.push({
        id: "formalization-created",
        title: "Formalização registrada",
        description: input.formalization.auctionDate
          ? `Pregão em ${input.formalization.auctionDate}`
          : undefined,
        occurredAt: created,
      });
    }
    const homologated = toIso(input.formalization.homologatedAt);
    if (homologated) {
      const rejected = input.formalization.status === "rejeitada";
      entries.push({
        id: "formalization-decided",
        title: rejected ? "Formalização rejeitada" : "Formalização homologada",
        description: input.formalization.homologationNote?.trim() || undefined,
        occurredAt: homologated,
      });
    }
  }

  const docsComplete = toIso(input.process.documentalCompletedAt);
  if (docsComplete) {
    entries.push({
      id: "docs-complete",
      title: "Pasta documental completa",
      description: "Todos os documentos obrigatórios foram colocados",
      occurredAt: docsComplete,
    });
  }

  return entries.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

/** Primeira data em que cada tipo documental foi colocado (para a aba Documentos). */
export function documentPlacementDates(
  documents: ProcessHistoryInput["documents"],
): { typeCode: string; label: string; placedAt: string; fileName: string }[] {
  const earliest = new Map<string, { placedAt: string; fileName: string }>();
  for (const document of documents) {
    if (document.linkStatus === "archived") continue;
    const at = toIso(document.createdAt);
    if (!at) continue;
    const current = earliest.get(document.typeCode);
    if (!current || at < current.placedAt) {
      earliest.set(document.typeCode, {
        placedAt: at,
        fileName: document.fileName ?? document.name ?? document.typeCode,
      });
    }
  }
  return ALL_DOCUMENT_TYPES
    .map((type) => {
      const hit = earliest.get(type.code);
      if (!hit) return null;
      return {
        typeCode: type.code,
        label: type.label,
        placedAt: hit.placedAt,
        fileName: hit.fileName,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}
