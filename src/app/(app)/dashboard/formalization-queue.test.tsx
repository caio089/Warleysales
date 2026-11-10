import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/formalizations/actions", () => ({
  homologateFormalizationAction: vi.fn(),
}));

import {
  FormalizationQueue,
  type PendingFormalizationItem,
} from "./formalization-queue";

describe("FormalizationQueue", () => {
  it("não renderiza nada quando lista estiver vazia", () => {
    const html = renderToStaticMarkup(<FormalizationQueue items={[]} />);
    expect(html).toBe("");
  });

  it("renderiza fila com dados do conselho, processo, fornecedor, valores e botões", () => {
    const items: PendingFormalizationItem[] = [
      {
        id: "form-1",
        processId: "proc-101",
        processNumber: "042/2026",
        councilId: "council-a",
        councilName: "CRF-SP",
        supplierId: "sup-1",
        supplierName: "Distribuidora Master Ltda",
        instrumentType: "contrato",
        instrumentNumber: "CTR-042/2026",
        estimatedValue: 100000,
        contractedValue: 80000,
        savingsValue: 20000,
        savingsPercent: 20,
      },
    ];

    const html = renderToStaticMarkup(<FormalizationQueue items={items} />);

    expect(html).toContain("Fila de Veredito — Homologação de Contratações");
    expect(html).toContain("1 pendente");
    expect(html).toContain("CRF-SP");
    expect(html).toContain("042/2026");
    expect(html).toContain("Distribuidora Master Ltda");
    expect(html).toContain("Contrato Administrativo nº CTR-042/2026");
    expect(html).toContain("Homologar");
    expect(html).toContain("Ver Processo");
    expect(html).toContain("/processos/proc-101");
  });
});
