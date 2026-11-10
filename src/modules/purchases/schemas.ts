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
  items: PurchaseRequestItem[];
  events: RequestEvent[];
  /** Chaves de recebimento já aplicadas (idempotência do recebimento). */
  receiptKeys: string[];
  createdBy: string;
  createdAt: Date;
}

export const createRequestSchema = z.object({
  councilId: idSchema,
  title: z.string().trim().min(3).max(200),
  createProcess: z.boolean().optional(),
  items: z.array(z.object({ materialId: idSchema, quantity: positiveQuantitySchema, ataItemId: idSchema.nullable().optional() })).min(1, "Informe ao menos um item."),
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
});
