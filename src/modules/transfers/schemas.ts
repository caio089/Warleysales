import { z } from "zod";
import { idSchema, positiveQuantitySchema } from "@/shared/lib/service-support";
import type { TransferStatus } from "./domain/transfer";

export interface TransferItem {
  materialId: string;
  quantity: number;
  receivedQuantity: number | null;
}

export interface TransferEvent {
  from: TransferStatus | null;
  to: TransferStatus;
  actorId: string;
  at: Date;
  note?: string;
}

export interface Transfer {
  id: string;
  /** Conselho que cede o material (reserva e baixa). */
  originCouncilId: string;
  /** Conselho que solicita/recebe. */
  destinationCouncilId: string;
  status: TransferStatus;
  items: TransferItem[];
  events: TransferEvent[];
  createdAt: Date;
}

export const requestTransferSchema = z.object({
  originCouncilId: idSchema,
  destinationCouncilId: idSchema,
  items: z.array(z.object({ materialId: idSchema, quantity: positiveQuantitySchema })).min(1, "Informe ao menos um item."),
}).refine((v) => v.originCouncilId !== v.destinationCouncilId, { message: "Origem e destino devem ser diferentes.", path: ["destinationCouncilId"] });

export const advanceTransferSchema = z.object({
  transferId: idSchema,
  to: z.enum(["em_analise", "aprovada", "separada", "em_transito", "recebida", "rejeitada", "cancelada"]),
  note: z.string().trim().max(300).optional(),
  /** Obrigatório ao receber: quantidade efetivamente recebida por material. */
  received: z.array(z.object({ materialId: idSchema, quantity: z.number().min(0) })).optional(),
});
