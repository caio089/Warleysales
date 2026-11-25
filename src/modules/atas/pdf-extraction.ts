import { z } from "zod";

const extractedItemSchema = z.object({
  description: z.string().max(300).nullable(),
  quantity: z.number().positive().nullable(),
  unitPrice: z.number().nonnegative().nullable(),
  lineTotal: z.number().nonnegative().nullable(),
});

const extractedSchema = z.object({
  supplierName: z.string().max(200).nullable(),
  supplierCnpj: z.string().max(30).nullable(),
  number: z.string().max(40).nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  totalValue: z.number().nonnegative().nullable(),
  items: z.array(extractedItemSchema).max(40).default([]),
});

export type ExtractedAta = z.infer<typeof extractedSchema>;
export type ExtractedAtaItem = z.infer<typeof extractedItemSchema>;

/** Interpreta o JSON da IA para pré-preencher a ata. */
export function parseExtractedAta(raw: string): ExtractedAta | null {
  try {
    const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = extractedSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) return null;
    const items = parsed.data.items.map((item) => {
      const quantity = item.quantity;
      const unitPrice = item.unitPrice;
      const lineTotal =
        item.lineTotal ??
        (quantity != null && unitPrice != null ? Math.round(quantity * unitPrice * 100) / 100 : null);
      return { ...item, lineTotal };
    });
    const totalValue =
      parsed.data.totalValue ??
      (items.some((item) => item.lineTotal != null)
        ? Math.round(items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0) * 100) / 100
        : null);
    return { ...parsed.data, items, totalValue };
  } catch {
    return null;
  }
}
