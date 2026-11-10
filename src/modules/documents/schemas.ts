import { z } from "zod";
import { MAX_UPLOAD_BYTES } from "@/shared/lib/upload-rules";
import { idSchema } from "@/shared/lib/service-support";
import { ALL_DOCUMENT_TYPE_CODES } from "@/modules/processes/domain/document-types";
import type { DocumentLinkStatus, ProcessAttachment, RetentionState, UploadStatus } from "@/modules/processes/domain/progress";

/** Anexo persistido (metadados; o binário vive no Storage privado, R15). */
export interface Attachment extends ProcessAttachment {
  id: string;
  processId: string;
  councilId: string;
  fileName: string;
  mime: string;
  size: number;
  sha256: string;
  storagePath: string;
  uploadedBy: string;
  createdAt: Date;
  linkStatus: DocumentLinkStatus;
  uploadStatus: UploadStatus;
  retentionState: RetentionState;
}

export const uploadDocumentSchema = z.object({
  processId: idSchema,
  typeCode: z.enum(ALL_DOCUMENT_TYPE_CODES as unknown as [string, ...string[]]),
  fileName: z.string().trim().min(1).max(255),
});

/** Fase 1 do upload direto: o cliente declara nome, tamanho e SHA-256; o servidor confere tudo na confirmação. */
export const prepareUploadSchema = uploadDocumentSchema.extend({
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "O arquivo excede o limite de 25 MB."),
  sha256: z.string().regex(/^[0-9a-f]{64}$/i, "SHA-256 inválido.").transform((value) => value.toLowerCase()),
});

/** Resposta da fase 1: dados para o navegador enviar o arquivo direto ao Storage privado. */
export interface PreparedUpload {
  attachmentId: string;
  storagePath: string;
  token: string;
  mime: string;
}

export const attachmentIdSchema = z.object({ attachmentId: idSchema });
