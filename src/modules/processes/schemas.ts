import { z } from "zod";
import { idSchema } from "@/shared/lib/service-support";
import type { DocumentalSnapshot } from "./domain/completion";
import type { ProcessStatus } from "./domain/process-status";
import type { ProcessContractingMode } from "./contracting-mode";
import type { PriceResearchLine } from "./price-research";

export interface AdministrativeProcess {
  responsibleId?: string | null;
  processType?: string | null;
  estimatedValue?: number | null;
  /** Linhas da pesquisa de preços (valor de referência por item). */
  priceResearchLines?: PriceResearchLine[] | null;
  /** Início da vigência informado no TR; reutilizado na ata e no contrato. */
  validityStartDate?: string | null;
  publicSessionDate?: string | null;
  /** Registro de preços (ata + contrato) ou somente contrato. */
  contractingMode?: ProcessContractingMode | null;
  documentExceptions?: Record<string, { justification: string; actorId: string; at: string }>;
  id: string;
  councilId: string;
  sequence: number;
  year: number;
  number: string; // NNN/AAAA
  title: string;
  status: ProcessStatus;
  /** R5: instante da última aquisição de 100%. */
  documentalCompletedAt: Date | null;
  /** R7: preenchido apenas após limpeza autorizada. */
  snapshot: DocumentalSnapshot | null;
  closingReportRegistered: boolean;
  closingJustification?: string | null;
  createdBy: string;
  createdAt: Date;
}

export const createProcessSchema = z.object({
  councilId: idSchema,
  responsibleId: idSchema.nullable().optional(),
  processType: z.string().trim().max(80).nullable().optional(),
  number: z.string().trim().regex(/^\d{1,6}\/\d{4}$/, "Use o formato NNN/AAAA."),
  title: z.string().trim().min(3, "Informe ao menos 3 caracteres.").max(200),
});
export const publicSessionDateSchema = z.object({
  processId: idSchema,
  publicSessionDate: z.iso.date().refine((date) => date.slice(0, 4) !== "0000", "Informe uma data válida.").nullable(),
});

export const classifyProcessSchema = z.object({
  processId: idSchema,
  responsibleId: idSchema.nullable(),
  processType: z.string().trim().max(80).nullable(),
});
export type CreateProcessInput = z.infer<typeof createProcessSchema>;

export const changeProcessStatusSchema = z.object({
  processId: idSchema,
  status: z.enum(["em_andamento", "aguardando_providencia", "concluido", "cancelado", "arquivado"]),
});

export const registerClosingSchema = z.object({
  processId: idSchema,
  closingJustification: z.string().trim().optional(),
});
export type RegisterClosingInput = z.infer<typeof registerClosingSchema>;
