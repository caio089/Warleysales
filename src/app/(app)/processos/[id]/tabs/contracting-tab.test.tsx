import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/modules/formalizations/actions", () => ({
  submitFormalizationFormAction: vi.fn(),
  homologateFormalizationAction: vi.fn(),
  rejectFormalizationAction: vi.fn(),
}));

import {
  ContractingTab,
  type LinkedAtaItem,
  type LinkedContractItem,
} from "./contracting-tab";
import type { FormalizationSupplier } from "../formalization-card";
import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";

const MOCK_SUPPLIERS: FormalizationSupplier[] = [
  { id: "sup-1", name: "Papelaria Central Ltda", cnpj: "12345678000195", active: true },
  { id: "sup-2", name: "Tech Soluções SA", cnpj: "98765432000100", active: true },
];

const BASE_FORMALIZATION: ProcessFormalization = {
  id: "form-123",
  processId: "proc-1",
  requestId: "req-1",
  councilId: "council-a",
  supplierId: "sup-1",
  instrumentType: "contrato",
  instrumentNumber: "CTR 045/2026",
  estimatedValue: 100000,
  contractedValue: 82000,
  savingsValue: 18000,
  savingsPercent: 18,
  status: "aguardando_homologacao",
  homologatedBy: null,
  homologatedAt: null,
  homologationNote: null,
  createdBy: "user-1",
  createdAt: new Date("2026-11-10T12:00:00Z"),
};

const MOCK_ATAS: LinkedAtaItem[] = [
  {
    id: "ata-1",
    number: "ARP 012/2026",
    endDate: "2026-12-31",
    status: "Vigente",
  },
];

const MOCK_CONTRACTS: LinkedContractItem[] = [
  {
    id: "contract-1",
    number: "CTR 045/2026",
    object: "Fornecimento de papel A4 para as unidades",
    value: 82000,
    endDate: "2027-06-30",
  },
];

describe("ContractingTab", () => {
  it("renderiza o cabeçalho de Instrumentos Contratuais Vinculados", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        linkedAtas={[]}
        linkedContracts={[]}
      />,
    );

    expect(html).toContain("Instrumentos Contratuais Vinculados");
  });

  it("exibe estados vazios sutis quando não há atas nem contratos vinculados", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        linkedAtas={[]}
        linkedContracts={[]}
      />,
    );

    expect(html).toContain("Nenhuma ata de registro de preços vinculada");
    expect(html).toContain("Nenhum contrato administrativo vinculado");
  });

  it("renderiza cards elegantes com links, vigência e valores para atas e contratos vinculados", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        linkedAtas={MOCK_ATAS}
        linkedContracts={MOCK_CONTRACTS}
      />,
    );

    // Ata card
    expect(html).toContain("ARP 012/2026");
    expect(html).toContain("Vigente");
    expect(html).toContain("31/12/2026");
    expect(html).toContain("/atas/ata-1");

    // Contract card
    expect(html).toContain("CTR 045/2026");
    expect(html).toContain("Fornecimento de papel A4 para as unidades");
    expect(html).toContain("R$");
    expect(html).toContain("82.000,00");
    expect(html).toContain("30/06/2027");
    expect(html).toContain("/contratos/contract-1");
  });

  it("incorpora a seção principal com o FormalizationCard e aviso de espera se documentos < 100%", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={false}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
      />,
    );

    expect(html).toContain("Formalização da Contratação");
    expect(html).toContain("Complete os 7 documentos obrigatórios para formalizar a contratação");
  });

  it("incorpora a seção principal com o FormalizationCard pronto para submissão se documentos 100%", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        defaultEstimatedValue={90000}
        requestItems={[{ materialId: "mat-1", name: "Papel Sulfite A4", quantity: 500 }]}
      />,
    );

    expect(html).toContain("Formalização da Contratação");
    expect(html).toContain("Apto para Formalização");
    expect(html).toContain("Papel Sulfite A4");
    expect(html).toContain("Papelaria Central Ltda");
  });

  it("renderiza a formalização homologada com resumo de economia dentro da aba", () => {
    const homologated: ProcessFormalization = {
      ...BASE_FORMALIZATION,
      status: "homologado",
      homologatedBy: "warley-user",
      homologatedAt: new Date("2026-11-10T14:30:00Z"),
      homologationNote: "Preço vantajoso e documentação regular.",
    };

    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={homologated}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        linkedAtas={MOCK_ATAS}
        linkedContracts={MOCK_CONTRACTS}
      />,
    );

    expect(html).toContain("Homologado por Warley");
    expect(html).toContain("Economia Obtida");
    expect(html).toContain("+18,00% de economia");
  });
});
