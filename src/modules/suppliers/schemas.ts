import { z } from "zod";
import { idSchema } from "@/shared/lib/service-support";
import { isValidCnpj, onlyDigits } from "./domain/cnpj";

export interface Supplier {
  id: string;
  name: string;
  /** Somente dígitos; único globalmente quando informado (P8). */
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
}

const supplierFields = {
  name: z.string().trim().min(2, "Informe a razão social.").max(200),
  cnpj: z.string().trim().optional().transform((v) => (v ? onlyDigits(v) : null))
    .refine((v) => v === null || isValidCnpj(v), "CNPJ inválido."),
  email: z.string().trim().email("E-mail inválido.").nullish().transform((v) => v ?? null),
  phone: z.string().trim().max(30).nullish().transform((v) => v ?? null),
};

export const createSupplierSchema = z.object(supplierFields);
export const updateSupplierSchema = z.object({ supplierId: idSchema, ...supplierFields, active: z.boolean().optional() });
