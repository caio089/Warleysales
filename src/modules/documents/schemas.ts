import { z } from "zod";
import { idSchema } from "@/shared/lib/service-support";
import { DOCUMENT_TYPE_CODES } from "@/modules/processes/domain/document-types";
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
  typeCode: z.enum(DOCUMENT_TYPE_CODES as [string, ...string[]]),
  fileName: z.string().trim().min(1).max(255),
});

export const attachmentIdSchema = z.object({ attachmentId: idSchema });
