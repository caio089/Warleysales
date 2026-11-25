import { describe, expect, it } from "vitest";

/** Espelha a leitura de linhas do formulário de movimentação. */
function readMovementLines(formData: FormData): { materialId: string; quantity: number }[] {
  const toNumber = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));
  const lines: { materialId: string; quantity: number }[] = [];
  for (let index = 0; index < 40; index += 1) {
    const materialId = String(formData.get(`items.${index}.materialId`) ?? "").trim();
    const quantityRaw = formData.get(`items.${index}.quantity`);
    if (!materialId && (quantityRaw == null || String(quantityRaw).trim() === "")) continue;
    lines.push({ materialId, quantity: toNumber(quantityRaw) });
  }
  if (lines.length > 0) return lines;
  const materialId = String(formData.get("materialId") ?? "").trim();
  const quantity = toNumber(formData.get("quantity"));
  if (materialId || Number.isFinite(quantity)) return [{ materialId, quantity }];
  return [];
}

describe("readMovementLines", () => {
  it("lê vários itens do formulário", () => {
    const form = new FormData();
    form.set("items.0.materialId", "m1");
    form.set("items.0.quantity", "10");
    form.set("items.1.materialId", "m2");
    form.set("items.1.quantity", "2,5");
    expect(readMovementLines(form)).toEqual([
      { materialId: "m1", quantity: 10 },
      { materialId: "m2", quantity: 2.5 },
    ]);
  });

  it("aceita o formato antigo de um único item", () => {
    const form = new FormData();
    form.set("materialId", "m9");
    form.set("quantity", "3");
    expect(readMovementLines(form)).toEqual([{ materialId: "m9", quantity: 3 }]);
  });
});
