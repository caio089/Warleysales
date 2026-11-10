import { z } from "zod";
import { idSchema, positiveQuantitySchema } from "@/shared/lib/service-support";

export const materialOrderStatuses = ["pendente", "aprovado", "rejeitado", "cancelado"] as const;
export type MaterialOrderStatus = (typeof materialOrderStatuses)[number];
export const materialOrderStatusSchema = z.enum(materialOrderStatuses);

export interface MaterialOrderItem {
  id: string;
  orderId: string;
  materialId: string;
  quantity: number;
}

export interface MaterialOrder {
  id: string;
  number: string;
  councilId: string;
  status: MaterialOrderStatus;
  requestedBy: string;
  notes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;
  items: MaterialOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export const createMaterialOrderItemSchema = z.object({
  id: idSchema.optional(),
  materialId: idSchema,
  quantity: positiveQuantitySchema,
});

export const createMaterialOrderSchema = z.object({
  id: idSchema.optional(),
  number: z.string().trim().min(1).optional(),
  councilId: idSchema,
  notes: z.string().trim().max(1000).nullable().optional(),
  items: z.array(createMaterialOrderItemSchema).min(1, "Informe ao menos um item."),
});

export type CreateMaterialOrderInput = z.infer<typeof createMaterialOrderSchema>;

export const approveMaterialOrderSchema = z.object({
  orderId: idSchema,
});

export type ApproveMaterialOrderInput = z.infer<typeof approveMaterialOrderSchema>;

export const rejectMaterialOrderSchema = z.object({
  orderId: idSchema,
  reason: z.string().trim().min(3, "Informe o motivo da recusa.").max(1000),
});

export type RejectMaterialOrderInput = z.infer<typeof rejectMaterialOrderSchema>;

export const cancelMaterialOrderSchema = z.object({
  orderId: idSchema,
});

export type CancelMaterialOrderInput = z.infer<typeof cancelMaterialOrderSchema>;
