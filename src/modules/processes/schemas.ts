import { z } from "zod";
import { idSchema } from "@/shared/lib/service-support";
import type { DocumentalSnapshot } from "./domain/completion";
import type { ProcessStatus } from "./domain/process-status";

export interface AdministrativeProcess {
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
  createdBy: string;
  createdAt: Date;
}

export const createProcessSchema = z.object({
  councilId: idSchema,
  number: z.string().trim().regex(/^\d{1,6}\/\d{4}$/, "Use o formato NNN/AAAA."),
  title: z.string().trim().min(3, "Informe ao menos 3 caracteres.").max(200),
});
export type CreateProcessInput = z.infer<typeof createProcessSchema>;

export const changeProcessStatusSchema = z.object({
  processId: idSchema,
  status: z.enum(["em_andamento", "aguardando_providencia", "concluido", "cancelado", "arquivado"]),
});
