import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/contracts/actions", () => ({ createContractFormAction: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }) }));

import { NewContractForm } from "./new-contract-form";

describe("NewContractForm na ata", () => {
  it("fixa a ata e permite informar o número de cada contrato", () => {
    const html = renderToStaticMarkup(
      <NewContractForm councils={[]} processes={[]} suppliers={[{ value: "supplier-1", label: "Fornecedor", cnpj: null }]}
        lockedProcess={{ councilId: "council-1", councilLabel: "Órgão", processId: "process-1",
          processLabel: "001/2026 — Cadeiras", processNumber: "001/2026", suggestedNumber: "CTR 001/2026 (2)", returnToAtaId: "ata-1",
          atas: [{ id: "ata-1", number: "ARP 001/2026", supplierId: "supplier-1", status: "Vigente",
            items: [{ itemId: "item-1", description: "Cadeira", materialLabel: "Cadeira", balance: 20, unitPrice: 700 }] }] }} />,
    );

    expect(html).toContain('name="returnTo" value="/atas/ata-1"');
    expect(html).toContain('name="ataId" value="ata-1"');
    expect(html).toContain("Ata selecionada:");
    expect(html).toContain("Número do contrato");
    expect(html).toContain('value="CTR 001/2026 (2)"');
    expect(html).toContain("Saldo na ata: 20");
  });
});
