import { z } from "zod";
import { idSchema, positiveQuantitySchema } from "@/shared/lib/service-support";
import type { PurchaseRequestStatus } from "./domain/request-status";

export interface PurchaseRequestItem {
  id: string;
  materialId: string;
  quantity: number;
  /** Item de ata opcional (P5): ao aprovar, compromete saldo da ata. */
  ataItemId: string | null;
  receivedTotal: number;
}

export interface RequestEvent {
  from: PurchaseRequestStatus | null;
  to: PurchaseRequestStatus;
  actorId: string;
  at: Date;
  note?: string;
}

export interface PurchaseRequest {
  id: string;
  councilId: string;
  title: string;
  status: PurchaseRequestStatus;
  processId?: string | null;
  estimatedValue?: number | null;
  items: PurchaseRequestItem[];
  events: RequestEvent[];
  /** Chaves de recebimento já aplicadas (idempotência do recebimento). */
  receiptKeys: string[];
  createdBy: string;
  createdAt: Date;
}

/** Item informado na solicitação: ou um material já existente, ou nome e unidade digitados. */
const requestItemSchema = z.object({
  materialId: idSchema.optional(),
  description: z.string().trim().min(2, "Informe o nome do item.").max(160).optional(),
  unit: z.string().trim().min(1).max(20).optional(),
  quantity: positiveQuantitySchema,
  ataItemId: idSchema.nullable().optional(),
}).refine((item) => Boolean(item.materialId) || Boolean(item.description), {
  message: "Informe o nome do item.",
  path: ["description"],
});

export const createRequestSchema = z.object({
  councilId: idSchema,
  title: z.string().trim().min(3).max(200),
  estimatedValue: z.number().min(0, "Valor estimado deve ser não-negativo").nullable().optional(),
  createProcess: z.boolean().optional(),
  items: z.array(requestItemSchema).min(1, "Informe ao menos um item."),
});

export const requestIdSchema = z.object({ requestId: idSchema });
export const decisionSchema = z.object({ requestId: idSchema, note: z.string().trim().max(500).optional() });
export const rejectSchema = z.object({ requestId: idSchema, note: z.string().trim().min(3, "Informe o motivo da rejeição.").max(500) });
export const reopenSchema = z.object({ requestId: idSchema, justification: z.string().trim().max(500) });
export const receiveSchema = z.object({
  requestId: idSchema,
  /** Chave gerada pelo cliente por recebimento: reenvio não duplica entrada de estoque. */
  receiptKey: z.string().trim().min(8).max(100),
  lines: z.array(z.object({ itemId: idSchema, received: positiveQuantitySchema })),
  closeIncomplete: z.boolean().optional(),
  incompleteJustification: z.string().trim().optional(),
});
export const receiveItemsSchema = receiveSchema;
export type ReceiveInput = z.infer<typeof receiveSchema>;
