import { z } from "zod";

const extractedItemSchema = z.object({
  description: z.string().trim().min(2).max(160),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(20).nullable(),
});

const extractedSchema = z.object({
  title: z.string().trim().min(3).max(200).nullable(),
  estimatedValue: z.number().nonnegative().nullable(),
  items: z.array(extractedItemSchema).min(1).max(80),
});

export type ExtractedPurchaseRequest = z.infer<typeof extractedSchema>;

/** Interpreta o JSON devolvido pela IA; rejeita payloads inválidos sem preencher o formulário. */
export function parseExtractedPurchaseRequest(raw: string): ExtractedPurchaseRequest | null {
  try {
    const clean = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = extractedSchema.safeParse(JSON.parse(clean));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const REQUEST_EXTRACTION_SYSTEM_PROMPT =
  "Extraia dados de uma solicitação de compra/demanda em português do Brasil. Use somente o texto fornecido. " +
  "Para dados ausentes ou ambíguos, use null. quantity deve ser número decimal positivo; unit pode ser un, cx, kg, L etc. " +
  "estimatedValue é o valor total estimado em reais (número), ou null. " +
  "Responda apenas JSON válido com as chaves title, estimatedValue, items (array de {description, quantity, unit}).";
