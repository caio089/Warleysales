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
  FormalizationCard,
  type FormalizationSupplier,
} from "./formalization-card";
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

describe("FormalizationCard", () => {
  it("exibe aviso de espera quando os documentos obrigatórios estão incompletos (<100%)", () => {
    const html = renderToStaticMarkup(
      <FormalizationCard
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
    expect(html).toContain("Aguardando Documentação");
    expect(html).not.toContain("Submeter para Homologação de Warley");
  });

  it("renderiza formulário com cálculo de economia em tempo real quando documentos estão 100%", () => {
    const html = renderToStaticMarkup(
      <FormalizationCard
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={null}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
        defaultEstimatedValue={50000}
      />,
    );

    expect(html).toContain("Formalização da Contratação");
    expect(html).toContain("Apto para Formalização");
    expect(html).toContain("Papelaria Central Ltda");
    expect(html).toContain("Contrato Administrativo");
    expect(html).toContain("Número do Instrumento");
    expect(html).toContain("Valor Estimado (R$)");
    expect(html).toContain("Valor Contratado (R$)");
    expect(html).toContain("Cálculo de Economia em Tempo Real");
    expect(html).toContain("Submeter para Homologação de Warley");
  });

  it("exibe badge amarelo e resumo quando aguarda homologação para usuário comum (sem botões de decisão)", () => {
    const html = renderToStaticMarkup(
      <FormalizationCard
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={BASE_FORMALIZATION}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
      />,
    );

    expect(html).toContain("Aguardando Homologação do Warley");
    expect(html).toContain("Papelaria Central Ltda");
    expect(html).toContain("Contrato Administrativo");
    expect(html).toContain("CTR 045/2026");
    expect(html).toContain("Somente a Central de Warley");
    expect(html).not.toContain("Homologar e Liberar Estoque");
  });

  it("renderiza botões de decisão (Homologar e Recusar) para Warley quando aguarda homologação", () => {
    const html = renderToStaticMarkup(
      <FormalizationCard
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={BASE_FORMALIZATION}
        suppliers={MOCK_SUPPLIERS}
        isWarley={true}
      />,
    );

    expect(html).toContain("Aguardando Homologação do Warley");
    expect(html).toContain("Decisão do Warley");
    expect(html).toContain("Homologar e Liberar Estoque");
    expect(html).toContain("Recusar com Justificativa");
  });

  it("exibe badge verde e resumo consolidado com economia obtida quando status é homologado", () => {
    const homologated: ProcessFormalization = {
      ...BASE_FORMALIZATION,
      status: "homologado",
      homologatedBy: "warley-user",
      homologatedAt: new Date("2026-11-10T14:30:00Z"),
      homologationNote: "Preço vantajoso e documentação regular.",
    };

    const html = renderToStaticMarkup(
      <FormalizationCard
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={homologated}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
      />,
    );

    expect(html).toContain("Homologado por Warley");
    expect(html).toContain("Papelaria Central Ltda");
    expect(html).toContain("Contrato Administrativo");
    expect(html).toContain("CTR 045/2026");
    expect(html).toContain("Economia Obtida");
    expect(html).toContain("+18,00% de economia");
    expect(html).toContain("Estoque liberado para pronto uso (saldo físico)");
    expect(html).toContain("Despacho de Warley: “Preço vantajoso e documentação regular.”");
  });

  it("exibe badge vermelho e justificativa quando status é rejeitada", () => {
    const rejected: ProcessFormalization = {
      ...BASE_FORMALIZATION,
      status: "rejeitada",
      homologatedBy: "warley-user",
      homologatedAt: new Date("2026-11-10T14:30:00Z"),
      homologationNote: "Preço cotado acima do limite prudencial de mercado.",
    };

    const html = renderToStaticMarkup(
      <FormalizationCard
        processId="proc-1"
        councilId="council-a"
        documentalComplete={true}
        formalization={rejected}
        suppliers={MOCK_SUPPLIERS}
        isWarley={false}
      />,
    );

    expect(html).toContain("Rejeitada por Warley");
    expect(html).toContain("Motivo da Recusa");
    expect(html).toContain("Preço cotado acima do limite prudencial de mercado.");
  });
});
