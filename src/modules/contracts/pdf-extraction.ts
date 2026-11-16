import { z } from "zod";

const extractedSchema = z.object({
  supplierName: z.string().max(200).nullable(),
  supplierCnpj: z.string().max(30).nullable(),
  number: z.string().max(40).nullable(),
  object: z.string().max(500).nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  value: z.number().nonnegative().nullable(),
});

export type ExtractedContract = z.infer<typeof extractedSchema>;

export function parseExtractedContract(raw: string): ExtractedContract | null {
  try {
    const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return extractedSchema.safeParse(JSON.parse(clean)).data ?? null;
  } catch {
    return null;
  }
}
