import { roundPercent } from "@/shared/lib/decimal";
import {
  DOCUMENT_TYPE_CODES,
  REQUIRED_DOCUMENT_COUNT,
  type DocumentTypeCode,
} from "./document-types";

export type UploadStatus = "pending" | "confirmed" | "failed";
export type RetentionState = "retained" | "archived" | "disposed";
export type DocumentLinkStatus = "active" | "replaced" | "archived" | "disposed";

/** Visão mínima de um anexo vinculado a um processo, suficiente para calcular progresso. */
export interface ProcessAttachment {
  typeCode: DocumentTypeCode;
  linkStatus: DocumentLinkStatus;
  uploadStatus: UploadStatus;
  retentionState: RetentionState;
}

export interface DocumentalProgress {
  /** Tipos distintos com ao menos um anexo válido. */
  validTypes: DocumentTypeCode[];
  missingTypes: DocumentTypeCode[];
  /** 0–100 com 2 casas (R1). Nunca editável manualmente (R3). */
  percent: number;
  isComplete: boolean;
}

/**
 * R2: anexo válido = upload confirmado, vínculo ativo e não eliminado.
 * Anexos substituídos, falhos, pendentes ou eliminados não contam.
 */
export function isValidAttachment(attachment: ProcessAttachment): boolean {
  return (
    attachment.uploadStatus === "confirmed" &&
    attachment.linkStatus === "active" &&
    attachment.retentionState !== "disposed"
  );
}

/** R1: progresso = tipos distintos válidos / 7 × 100. Vários arquivos do mesmo tipo contam 1. */
export function calculateProgress(attachments: readonly ProcessAttachment[]): DocumentalProgress {
  const validSet = new Set<DocumentTypeCode>(
    attachments.filter(isValidAttachment).map((a) => a.typeCode),
  );
  const validTypes = DOCUMENT_TYPE_CODES.filter((code) => validSet.has(code));
  const missingTypes = DOCUMENT_TYPE_CODES.filter((code) => !validSet.has(code));
  return {
    validTypes,
    missingTypes,
    percent: roundPercent((validTypes.length / REQUIRED_DOCUMENT_COUNT) * 100),
    isComplete: validTypes.length === REQUIRED_DOCUMENT_COUNT,
  };
}
