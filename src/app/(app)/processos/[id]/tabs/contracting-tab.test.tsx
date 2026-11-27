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

vi.mock("@/modules/atas/actions", () => ({
  linkAtaProcessFormAction: vi.fn(),
  ataStepFormAction: vi.fn(),
  createAtaFormAction: vi.fn(),
}));

vi.mock("@/modules/contracts/actions", () => ({
  linkContractProcessFormAction: vi.fn(),
  createContractFormAction: vi.fn(),
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
    items: [{ itemId: "ata-item-1", description: "Papel A4", materialLabel: "PAP-01 — Papel A4", registered: 100, committed: 25, balance: 75, unitPrice: 150 }],
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
    const ataStep = html.indexOf("1. Ata de registro de preços");
    const contractStep = html.indexOf("2. Contrato");
    expect(ataStep).toBeGreaterThan(-1);
    expect(contractStep).toBeGreaterThan(ataStep);
    expect(html).toContain("Primeiro anexe ou crie a ata. Depois anexe ou crie o contrato.");
  });

  it("permite vincular ata e contrato livres ou criar um novo já neste processo", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        canLink
        contractingMode="registro_precos"
        availableAtas={[{ value: "ata-9", label: "ARP 099/2026" }]}
        availableContracts={[{ value: "ctr-9", label: "CT 099/2026" }]}
        draft={{
          councilLabel: "CRQ18",
          processLabel: "12/2027 — Material de expediente",
          processNumber: "12/2027",
          materials: [{ value: "mat-1", label: "Papel A4" }],
          requestMaterials: [{ materialId: "mat-1", name: "Papel A4", quantity: 100 }],
          defaultValue: 5000,
          validityStartDate: "2026-03-01",
          suppliers: [{ value: "sup-1", label: "Papelaria Central Ltda", cnpj: null }],
        }}
      />,
    );

    expect(html).toContain("Vincular ata existente");
    expect(html).toContain("ARP 099/2026");
    expect(html).toContain("Anexar contrato");
    expect(html).toContain("CT 099/2026");
    expect(html).toContain("Houve mais de uma empresa vencedora nesta licitação?");
    expect(html).not.toContain("Número da ata");
    expect(html).toContain("Registrar contrato");
    expect(html).toContain("12/2027 — Material de expediente");
    expect(html.indexOf("1. Ata de registro de preços")).toBeLessThan(html.indexOf("2. Contrato"));
  });

  it("oculta os campos de cadastro de ata quando já existe uma vinculada", () => {
    const html = renderToStaticMarkup(
      <ContractingTab processId="proc-1" councilId="council-a" documentalComplete formalization={null}
        suppliers={MOCK_SUPPLIERS} isWarley={false} canLink contractingMode="registro_precos"
        linkedAtas={MOCK_ATAS}
        draft={{ councilLabel: "CRQ18", processLabel: "Processo", processNumber: "012/2026",
          materials: [], requestMaterials: [], suppliers: [] }} />,
    );
    expect(html).toContain("Criar outra ata");
    expect(html).not.toContain("Número da ata");
    expect(html).not.toContain("Ler ata em PDF para preencher");
  });

  it("esconde a ata quando o processo é somente contrato", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        canLink
        contractingMode="contrato"
        availableContracts={[{ value: "ctr-9", label: "CT 099/2026" }]}
        draft={{
          councilLabel: "CRQ18",
          processLabel: "12/2027 — Material de expediente",
          processNumber: "12/2027",
          materials: [],
          requestMaterials: [],
          suppliers: [{ value: "sup-1", label: "Papelaria Central Ltda", cnpj: null }],
        }}
      />,
    );

    expect(html).toContain("somente contrato");
    expect(html).toContain("1. Contrato");
    expect(html).not.toContain("1. Ata de registro de preços");
    expect(html).not.toContain("Valor da ata");
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
    expect(html).toContain("Ver saldo e detalhes");
    expect(html).toContain("Saldo por item");
    expect(html).toContain("PAP-01 — Papel A4");
    expect(html).toContain("15.000,00");
    expect(html).toContain(">75<");

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

  it("exibe a economia do contrato e mantém os formulários ocultos após o registro", () => {
    const html = renderToStaticMarkup(
      <ContractingTab
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        canLink
        defaultEstimatedValue={90000}
        requestItems={[{ materialId: "mat-1", name: "Papel Sulfite A4", quantity: 500 }]}
        linkedAtas={MOCK_ATAS}
        linkedContracts={MOCK_CONTRACTS}
      />,
    );

    expect(html).toContain("Cálculo da economia gerada");
    expect(html).toContain("8.000,00");
    expect(html).toContain("Enviar para homologação");
    expect(html).not.toContain("Ler contrato em PDF para preencher");
    expect(html).not.toContain("Formalização da Contratação");
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

    expect(html).not.toContain("Formalização da Contratação");
    expect(html).toContain("Economia Gerada");
    expect(html).toContain("+18,00% de economia");
  });
});
