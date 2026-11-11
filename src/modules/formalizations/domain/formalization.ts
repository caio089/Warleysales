import { z } from "zod";
import { idSchema } from "@/shared/lib/service-support";

export type InstrumentType = "ata" | "contrato" | "empenho";
export type FormalizationStatus = "aguardando_homologacao" | "homologado" | "rejeitada";

export interface ProcessFormalization {
  id: string;
  processId: string;
  requestId: string | null;
  councilId: string;
  supplierId: string;
  instrumentType: InstrumentType;
  instrumentNumber: string;
  estimatedValue: number;
  contractedValue: number;
  savingsValue: number;
  savingsPercent: number;
  /** Data em que o pregão foi realizado (AAAA-MM-DD). */
  auctionDate?: string | null;
  /** Quantidade contratada, usada para corrigir o saldo bloqueado antes da liberação. */
  contractedQuantity?: number | null;
  status: FormalizationStatus;
  homologatedBy: string | null;
  homologatedAt: Date | null;
  homologationNote: string | null;
  createdBy: string;
  createdAt: Date;
}

export const instrumentTypes = ["ata", "contrato", "empenho"] as const;
export const formalizationStatuses = ["aguardando_homologacao", "homologado", "rejeitada"] as const;

export const instrumentTypeSchema = z.enum(instrumentTypes);
export const formalizationStatusSchema = z.enum(formalizationStatuses);

const contractedItemSchema = z.object({
  materialId: idSchema,
  quantity: z.number().positive("A quantidade deve ser maior que zero"),
});

export const submitFormalizationSchema = z.object({
  processId: idSchema,
  requestId: idSchema.nullable().optional(),
  councilId: idSchema,
  supplierId: idSchema,
  instrumentType: instrumentTypeSchema.optional(),
  instrumentNumber: z.string().trim().min(1).max(100).optional(),
  auctionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data do pregão.").optional(),
  contractedQuantity: z.number().positive("A quantidade deve ser maior que zero").optional(),
  items: z.array(contractedItemSchema).optional(),
  estimatedValue: z.number().min(0, "Valor estimado deve ser não-negativo"),
  contractedValue: z.number().min(0, "Valor contratado deve ser não-negativo"),
});

export type SubmitFormalizationInput = z.infer<typeof submitFormalizationSchema>;

export const homologateFormalizationSchema = z.object({
  processId: idSchema,
  note: z.string().trim().max(1000).optional(),
  items: z
    .array(
      z.object({
        materialId: idSchema,
        quantity: z.number().positive("A quantidade deve ser maior que zero"),
      }),
    )
    .optional(),
});

export type HomologateFormalizationInput = z.infer<typeof homologateFormalizationSchema>;

export const rejectFormalizationSchema = z.object({
  processId: idSchema,
  note: z.string().trim().min(1, "Motivo da rejeição é obrigatório").max(1000),
});

export type RejectFormalizationInput = z.infer<typeof rejectFormalizationSchema>;

/**
 * Calcula a economia gerada em valor absoluto e percentual.
 * Economia = Valor Estimado − Valor Contratado.
 * Percentual = (Economia / Estimado) * 100, arredondado a 2 casas.
 */
export function calculateSavings(estimated: number, contracted: number): { savingsValue: number; savingsPercent: number } {
  const savingsValue = Math.round((estimated - contracted) * 100) / 100;
  const savingsPercent = estimated > 0 ? Math.round(((savingsValue / estimated) * 100) * 100) / 100 : 0;
  return { savingsValue, savingsPercent };
}
