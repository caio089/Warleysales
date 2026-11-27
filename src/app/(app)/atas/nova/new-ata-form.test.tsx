import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@/modules/atas/actions", () => ({
  createAtaFormAction: vi.fn(),
}));

import { NewAtaForm, suggestAtaNumber } from "./new-ata-form";

describe("suggestAtaNumber", () => {
  it("sufixa quando o número preferido já existe", () => {
    expect(suggestAtaNumber("ARP 042/2026", [])).toBe("ARP 042/2026");
    expect(suggestAtaNumber("ARP 042/2026", ["ARP 042/2026"])).toBe("ARP 042/2026 (2)");
  });
});

describe("NewAtaForm (no processo)", () => {
  it("pergunta sobre múltiplos vencedores antes de abrir o cadastro da ata", () => {
    const html = renderToStaticMarkup(
      <NewAtaForm
        councils={[]}
        materials={[]}
        processes={[]}
        lockedProcess={{
          councilId: "c1",
          councilLabel: "CRO-CE",
          processId: "11111111-1111-1111-1111-111111111111",
          processLabel: "042/2026 — Resina",
          processNumber: "042/2026",
          materials: [
            { materialId: "m1", name: "Resina Fotopolimerizável", quantity: 10 },
            { materialId: "m2", name: "Luva procedimento", quantity: 100 },
          ],
          suppliers: [{ value: "s1", label: "Fornecedor Alfa", cnpj: "12345678000195" }],
          defaultValue: 15000,
          existingAtaNumbers: ["ARP 042/2026"],
        }}
      />,
    );

    expect(html).toContain("Houve mais de uma empresa vencedora nesta licitação?");
    expect(html).not.toContain("Número da ata");
    expect(html).not.toContain('name="supplierName"');
  });
});
