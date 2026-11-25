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
  object: z.string().max(500).nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  value: z.number().nonnegative().nullable(),
  items: z.array(extractedItemSchema).max(40).default([]),
});

export type ExtractedContract = z.infer<typeof extractedSchema>;

export function parseExtractedContract(raw: string): ExtractedContract | null {
  try {
    const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = extractedSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) return null;
    const items = parsed.data.items.map((item) => {
      const lineTotal =
        item.lineTotal ??
        (item.quantity != null && item.unitPrice != null
          ? Math.round(item.quantity * item.unitPrice * 100) / 100
          : null);
      return { ...item, lineTotal };
    });
    const value =
      parsed.data.value ??
      (items.some((item) => item.lineTotal != null)
        ? Math.round(items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0) * 100) / 100
        : null);
    return { ...parsed.data, items, value };
  } catch {
    return null;
  }
}
