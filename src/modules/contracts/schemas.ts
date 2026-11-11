import { z } from "zod";
import { dateOnlySchema, idSchema } from "@/shared/lib/service-support";
import type { ContractAmendment, ContractTerms } from "./domain/terms";

/** R8: contrato é entidade distinta de ata de registro de preços e de estoque. */
export interface Contract {
  id: string;
  councilId: string;
  number: string;
  supplierId: string | null;
  /** Processo administrativo do mesmo órgão. Atas com o mesmo processo ficam ligadas a este contrato. */
  processId?: string | null;
  object: string;
  original: ContractTerms;
  amendments: ContractAmendment[];
  createdAt: Date;
}

export const createContractSchema = z.object({
  councilId: idSchema,
  number: z.string().trim().min(1).max(40),
  supplierId: idSchema.nullable().optional(),
  processId: idSchema.nullable().optional(),
  object: z.string().trim().min(3).max(500),
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
  value: z.number().min(0),
});

export const linkContractProcessSchema = z.object({
  contractId: idSchema,
  processId: idSchema.nullable(),
});

export const addAmendmentSchema = z.object({
  contractId: idSchema,
  reason: z.string().trim().min(3).max(500),
  endDate: dateOnlySchema.optional(),
  value: z.number().min(0).optional(),
  signedAt: dateOnlySchema,
});
