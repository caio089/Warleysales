import { z } from "zod";
import { idSchema, positiveQuantitySchema } from "@/shared/lib/service-support";
import type { MovementType } from "./domain/stock";

export interface Material {
  id: string;
  code: string;
  name: string;
  unit: string;
  active: boolean;
}

export interface MovementRecord {
  id: string;
  councilId: string;
  materialId: string;
  type: MovementType;
  quantity: number;
  idempotencyKey: string;
  reason: string;
  reference: string | null; // ex.: receipt:<id>, transfer:<id>
  actorId: string | null;
  createdAt: Date;
}

export const createMaterialSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(160),
  unit: z.string().trim().min(1).max(20),
});

export const registerMovementSchema = z.object({
  councilId: idSchema,
  materialId: idSchema,
  type: z.enum(["entry", "consumption", "adjustment_in", "adjustment_out"]),
  quantity: positiveQuantitySchema,
  /** Gerada pelo cliente por operação: reenvio/duplo clique não duplica (idempotência). */
  idempotencyKey: z.string().trim().min(8).max(100),
  reason: z.string().trim().min(3, "Informe o motivo.").max(300),
});

export const setMinimumSchema = z.object({ councilId: idSchema, materialId: idSchema, minimum: z.number().min(0) });
