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
  it("preenche a edição com os dados da ata atual e exige justificativa", () => {
    const html = renderToStaticMarkup(<NewAtaForm councils={[]} materials={[]} processes={[]} lockedProcess={{
      councilId: "c1", councilLabel: "Órgão", processId: "proc", processLabel: "Processo", processNumber: "01/2026",
      suppliers: [], materials: [{ materialId: "m1", name: "Papel", quantity: 5 }],
      validityStartDate: "2026-11-01", existingAtaNumbers: ["ARP-01"], requireReplacementJustification: true,
      replacement: { number: "ARP-01", supplierName: "Fornecedor atual", lineTotals: [125.5] },
    }} />);
    expect(html).toContain("Justificativa da troca de ata");
    expect(html).toContain('value="ARP-01 (2)"');
    expect(html).toContain('value="Fornecedor atual"');
    expect(html).toContain('value="125,50"');
    expect(html).toContain('name="items.0.registeredQuantity"');
    expect(html).toContain('name="items.0.description"');
  });
  it("mostra número editável, empresa, materiais, vigência e valor", () => {
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

    expect(html).toContain("Número da ata");
    expect(html).toContain('value="ARP 042/2026 (2)"');
    expect(html).toContain("1. Empresa vencedora");
    expect(html).toContain("Nome da empresa");
    expect(html).toContain('name="supplierName"');
    expect(html).toContain("2. Materiais e valores");
    expect(html).toContain("Resina Fotopolimerizável");
    expect(html).toContain("Valor unitário");
    expect(html).toContain("Total da ata");
    expect(html).toContain("Início da vigência");
  });
});
