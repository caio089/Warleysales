import { z } from "zod";
import { dateOnlySchema, idSchema, positiveQuantitySchema } from "@/shared/lib/service-support";
import type { CouncilAllocation } from "./domain/balance";
import type { AtaExtension } from "./domain/validity";

/** R8: ata de registro de preços (compras) — nada a ver com ata de reunião, estoque ou contrato. */
export interface AtaItem {
  id: string;
  description: string;
  materialId: string | null;
  registeredQuantity: number;
  unitPrice: number;
  /** P5: alocação opcional por conselho. */
  allocations: CouncilAllocation[];
}

export type AtaStatus = "rascunho" | "vigente";

export interface PriceRegistrationAta {
  id: string;
  councilId: string; // conselho gerenciador
  number: string;
  supplierId: string | null;
  startDate: string;
  status: AtaStatus;
  items: AtaItem[];
  extensions: AtaExtension[];
  createdAt: Date;
}

export const createAtaSchema = z.object({
  councilId: idSchema,
  number: z.string().trim().min(1).max(40),
  supplierId: idSchema.nullable().optional(),
  startDate: dateOnlySchema,
  items: z.array(z.object({
    description: z.string().trim().min(2).max(300),
    materialId: idSchema.nullable().optional(),
    registeredQuantity: positiveQuantitySchema,
    unitPrice: z.number().min(0),
  })).min(1, "Informe ao menos um item."),
});

export const ataIdSchema = z.object({ ataId: idSchema });

export const setAllocationsSchema = z.object({
  ataId: idSchema,
  itemId: idSchema,
  allocations: z.array(z.object({ councilId: idSchema, quantity: positiveQuantitySchema })),
});
