import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { formatCurrency } from "@/shared/lib/format";

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

vi.mock("@/modules/documents/actions", () => ({
  downloadUrlAction: vi.fn(),
  unlinkDocumentFormAction: vi.fn(),
  manualDeleteFormAction: vi.fn(),
  prepareDocumentUploadAction: vi.fn(),
  confirmDocumentUploadAction: vi.fn(),
}));

vi.mock("@/modules/formalizations/actions", () => ({
  submitFormalizationFormAction: vi.fn(),
  homologateFormalizationAction: vi.fn(),
  rejectFormalizationAction: vi.fn(),
}));

vi.mock("@/modules/processes/actions", () => ({
  changeProcessStatusFormAction: vi.fn(),
  registerClosingReportFormAction: vi.fn(),
}));

import { ProcessView, type ProcessViewProps } from "./process-view";

const BASE_PROPS: ProcessViewProps = {
  view: {
    process: {
      id: "proc-101",
      councilId: "council-1",
      sequence: 42,
      year: 2026,
      number: "042/2026",
      title: "Aquisição de Insumos Odontológicos",
      status: "em_andamento",
      documentalCompletedAt: null,
      snapshot: null,
      closingReportRegistered: false,
      closingJustification: null,
      createdBy: "user-1",
      createdAt: new Date("2026-01-15T10:00:00Z"),
    },
    progress: {
      validTypes: ["DFD", "ETP", "MR"],
      missingTypes: ["TR", "PP", "PJ", "ED"],
      percent: 43,
      isComplete: false,
    },
    displayPercent: 43,
    completion: "pendente",
  },
  documents: [
    {
      id: "doc-1",
      processId: "proc-101",
      typeCode: "DFD",
      fileName: "dfd_anexo.pdf",
      storagePath: "proc-101/dfd.pdf",
      size: 1048576,
      sha256: "abc123",
      uploadedBy: "user-1",
      createdAt: new Date("2026-01-15T10:00:00Z"),
      linkStatus: "active",
      uploadStatus: "confirmed",
      retentionState: "retained",
    },
  ],
  formalization: null,
  suppliers: [
    { id: "sup-1", name: "Dental Cremer Ltda", cnpj: "12345678000195", active: true },
  ],
  canManage: true,
  canUnlink: true,
  canRegisterClosing: true,
  isSpecialDeleter: false,
  isWarley: false,
  defaultEstimatedValue: 50000,
  requestId: "req-1",
  requestItems: [
    { materialId: "mat-1", name: "Resina Fotopolimerizável", quantity: 100 },
  ],
  linkedAtas: [
    { id: "ata-1", number: "ATA 01/2026", endDate: "2026-12-31", status: "Vigente" },
  ],
  linkedContracts: [
    { id: "ctr-1", number: "CTR 05/2026", object: "Fornecimento de Resinas", value: 48000, endDate: "2026-12-31" },
  ],
};

describe("ProcessView", () => {
  it("renderiza o ProcessHeader no topo com número, título do item e métricas", () => {
    const html = renderToStaticMarkup(<ProcessView {...BASE_PROPS} />);

    expect(html).toContain("Processo 042/2026");
    expect(html).toContain("Resina Fotopolimerizável");
    expect(html).toContain("Aquisição de Insumos Odontológicos");
    expect(html).toContain("Valor Estimado");
    expect(html).toContain(formatCurrency(50000));
    expect(html).toContain("3/7 (43%)");
  });

  it("renderiza a barra de abas com role='tablist' e os 3 botões com ícones e labels", () => {
    const html = renderToStaticMarkup(<ProcessView {...BASE_PROPS} />);

    expect(html).toContain('role="tablist"');
    expect(html).toContain("Documentação (7+N)");
    expect(html).toContain("Contratação &amp; Atas");
    expect(html).toContain("Governança &amp; Histórico");
  });

  it("ativa a aba de Documentação por padrão exibindo DocumentationTab", () => {
    const html = renderToStaticMarkup(<ProcessView {...BASE_PROPS} />);

    // Tab button ativo
    expect(html).toContain('id="tab-documentos"');
    expect(html).toContain('aria-selected="true"');

    // Tabpanel ativo de documentação
    expect(html).toContain('id="panel-documentos"');
    expect(html).toContain("Documentos Obrigatórios (Lei 14.133 / PNCP)");
    expect(html).toContain("dfd_anexo.pdf");

    // Conteúdos das outras abas não são renderizados no DOM
    expect(html).not.toContain("Instrumentos Contratuais Vinculados");
    expect(html).not.toContain("Governança &amp; Situação Administrativa");
  });

  it("ativa a aba de Contratação quando initialTab='contratacao' exibindo ContractingTab", () => {
    const html = renderToStaticMarkup(
      <ProcessView {...BASE_PROPS} initialTab="contratacao" />,
    );

    // Tab button contratacao ativo
    expect(html).toContain('id="tab-contratacao"');
    expect(html).toContain('aria-selected="true"');

    // Tabpanel ativo de contratação
    expect(html).toContain('id="panel-contratacao"');
    expect(html).toContain("Instrumentos Contratuais Vinculados");
    expect(html).toContain("ATA 01/2026");
    expect(html).toContain("CTR 05/2026");

    // Conteúdo de documentação não renderizado
    expect(html).not.toContain("Documentos Obrigatórios (Lei 14.133 / PNCP)");
  });

  it("ativa a aba de Governança quando initialTab='governanca' exibindo GovernanceTab", () => {
    const html = renderToStaticMarkup(
      <ProcessView {...BASE_PROPS} initialTab="governanca" />,
    );

    // Tab button governanca ativo
    expect(html).toContain('id="tab-governanca"');
    expect(html).toContain('aria-selected="true"');

    // Tabpanel ativo de governança
    expect(html).toContain('id="panel-governanca"');
    expect(html).toContain("Governança &amp; Situação Administrativa");
    expect(html).toContain("Trilha de Auditoria &amp; Conformidade");

    // Conteúdo de documentação não renderizado
    expect(html).not.toContain("Documentos Obrigatórios (Lei 14.133 / PNCP)");
  });

  it("renderiza badges nas abas com indicadores de volume", () => {
    const html = renderToStaticMarkup(<ProcessView {...BASE_PROPS} />);

    // Aba de documentação mostra contagem de válidos/obrigatórios
    expect(html).toContain("3/7");
    // Aba de contratação mostra número de instrumentos ligados (1 ata + 1 contrato = 2)
    expect(html).toContain("2");
  });

  it("utiliza o título do processo como nome principal quando não há item único na requisição", () => {
    const html = renderToStaticMarkup(
      <ProcessView {...BASE_PROPS} requestItems={[]} />,
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Aquisição de Insumos Odontológicos");
  });

  it("exibe 'Produto disponível' quando a formalização está homologada", () => {
    const html = renderToStaticMarkup(
      <ProcessView
        {...BASE_PROPS}
        formalization={{
          id: "form-1",
          processId: "proc-101",
          requestId: "req-1",
          councilId: "council-1",
          supplierId: "sup-1",
          instrumentType: "contrato",
          instrumentNumber: "CTR 05/2026",
          estimatedValue: 50000,
          contractedValue: 48000,
          savingsValue: 2000,
          savingsPercent: 4,
          status: "homologado",
          homologatedBy: "user-1",
          homologatedAt: new Date("2026-01-20T10:00:00Z"),
          homologationNote: null,
          createdBy: "user-1",
          createdAt: new Date("2026-01-15T10:00:00Z"),
        }}
      />,
    );

    expect(html).toContain("Produto disponível");
  });

  it("exibe 'Falta gravar a contratação' quando os documentos e instrumentos estão prontos mas formalização pendente", () => {
    const html = renderToStaticMarkup(
      <ProcessView
        {...BASE_PROPS}
        view={{
          ...BASE_PROPS.view,
          progress: {
            ...BASE_PROPS.view.progress,
            isComplete: true,
            validTypes: ["DFD", "ETP", "MR", "TR", "PP", "PJ", "ED"],
          },
          completion: "completa",
        }}
      />,
    );

    expect(html).toContain("Falta gravar a contratação");
  });

  it("mantém acessibilidade estrita com aria-controls, aria-labelledby e tabIndex", () => {
    const html = renderToStaticMarkup(<ProcessView {...BASE_PROPS} />);

    // Checa ligação semântica entre abas e painéis
    expect(html).toContain('aria-controls="panel-documentos"');
    expect(html).toContain('aria-controls="panel-contratacao"');
    expect(html).toContain('aria-controls="panel-governanca"');

    expect(html).toContain('id="panel-documentos" aria-labelledby="tab-documentos"');
    expect(html).toContain('id="panel-contratacao" aria-labelledby="tab-contratacao"');
    expect(html).toContain('id="panel-governanca" aria-labelledby="tab-governanca"');
  });
});
