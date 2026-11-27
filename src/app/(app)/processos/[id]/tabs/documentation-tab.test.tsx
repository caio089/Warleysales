vi.mock("@/modules/processes/actions", () => ({ savePublicSessionDateFormAction: vi.fn() }));
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/modules/processes/estimated-value-action", () => ({ saveProcessEstimatedValue: vi.fn() }));
vi.mock("@/modules/processes/price-research-action", () => ({ saveProcessPriceResearch: vi.fn() }));
vi.mock("@/modules/processes/validity-start-action", () => ({ saveProcessValidityStartDate: vi.fn() }));
vi.mock("@/modules/processes/contracting-mode-action", () => ({ saveProcessContractingMode: vi.fn() }));
vi.mock("@/modules/processes/exception-action", () => ({ documentExceptionAction: vi.fn() }));

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

import { DocumentationTab, type DocumentationTabProps } from "./documentation-tab";

const BASE_PROPS: DocumentationTabProps = {
  processId: "proc-999",
  validTypes: ["DFD", "TR"],
  documents: [
    {
      typeCode: "DFD",
      linkStatus: "active",
      uploadStatus: "confirmed",
      retentionState: "retained",
      id: "doc-dfd-1",
      fileName: "dfd_oficial.pdf",
      size: 1048576, // 1 MB
      createdAt: "2026-11-10T10:00:00Z",
    },
    {
      typeCode: "TR",
      linkStatus: "active",
      uploadStatus: "confirmed",
      retentionState: "retained",
      id: "doc-tr-1",
      fileName: "termo_referencia.pdf",
      size: 2097152, // 2 MB
      createdAt: "2026-11-10T11:00:00Z",
    },
  ],
  canManage: true,
  canUnlink: true,
};

describe("DocumentationTab", () => {
  it("exibe a data logo após o edital na seção de documentos obrigatórios", () => {
    const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} publicSessionDate="2026-12-07" />);
    const mandatory = html.match(/<section aria-label="Documentos Obrigatórios[^>]*>[\s\S]*?<\/section>/)?.[0];
    expect(mandatory).toContain("07/12/2026");
    expect(mandatory!.indexOf("7. Edital de Licitação / Aviso")).toBeLessThan(mandatory!.indexOf("Data da sessão pública"));
  });
  describe("Seção 1: Documentos Obrigatórios (Lei 14.133 / PNCP)", () => {
    it("renderiza o cabeçalho do card com título e texto contextual", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} />);
      expect(html).toContain("Documentos Obrigatórios (Lei 14.133 / PNCP)");
      expect(html).toContain("Cada etapa aceita mais de um arquivo. Um arquivo válido de cada tipo já conta para a conformidade.");
    });

    it("renderiza todos os 7 documentos obrigatórios na ordem legal", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} />);

      // Códigos
      expect(html).toContain("DFD");
      expect(html).toContain("ETP");
      expect(html).toContain("MR");
      expect(html).toContain("TR");
      expect(html).toContain("PP");
      expect(html).toContain("PJ");
      expect(html).toContain("ED");

      // Rótulos na ordem legal
      expect(html).toContain("1. Documento de Formalização da Demanda");
      expect(html).toContain("2. Estudo Técnico Preliminar");
      expect(html).toContain("3. Matriz de Riscos");
      expect(html).toContain("4. Termo de Referência");
      expect(html).toContain("5. Pesquisa de Preços");
      expect(html).toContain("6. Parecer Jurídico / Técnico");
      expect(html).toContain("7. Edital de Licitação / Aviso");
    });

    it("renderiza status válido para tipos cumpridos e pendente para faltantes", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} />);

      // DFD e TR estão em validTypes
      expect(html).toContain("dfd_oficial.pdf");
      expect(html).toContain("termo_referencia.pdf");

      // Pendentes devem ter o badge Pendente
      expect(html).toContain("Pendente");
    });

    it("permite informar a vigência no TR para reutilizar na ata e no contrato", () => {
      const html = renderToStaticMarkup(
        <DocumentationTab
          {...BASE_PROPS}
          validityStartDate="2026-03-01"
          canEditValidityStart
        />,
      );
      expect(html).toContain("Vigência no Termo de Referência");
      expect(html).toContain("Salvar vigência");
      expect(html).toContain("01/03/2026");
    });

    it("pergunta se é registro de preços para definir ata ou só contrato", () => {
      const html = renderToStaticMarkup(
        <DocumentationTab {...BASE_PROPS} canEditContractingMode contractingMode={null} />,
      );
      expect(html).toContain("É registro de preços?");
      expect(html).toContain("Sim — registro de preços");
      expect(html).toContain("Não — só contrato");
      expect(html).toContain("Salvar resposta");
    });
  });

  describe("Seção 2: Artefatos Adicionais & Complementares", () => {
    it("renderiza o cabeçalho da seção de artefatos adicionais com texto explicativo", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} />);
      expect(html).toContain("Artefatos Adicionais &amp; Complementares");
      expect(html).toContain("Documentos complementares, minutas ou laudos que não alteram a régua dos 7 obrigatórios.");
    });

    it("exibe mensagem vazia quando não há arquivos complementares", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} />);
      expect(html).toContain("Nenhum artefato adicional ou complementar anexado.");
    });

    it("renderiza itens adicionais (OUTRO) com nome, tamanho, data e ações", () => {
      const propsWithAdditional: DocumentationTabProps = {
        ...BASE_PROPS,
        documents: [
          ...BASE_PROPS.documents,
          {
            typeCode: "OUTRO",
            linkStatus: "active",
            uploadStatus: "confirmed",
            retentionState: "retained",
            id: "doc-outro-1",
            fileName: "laudo_tecnico_pericial.pdf",
            size: 524288, // 512 KB
            createdAt: "2026-11-10T15:00:00Z",
          },
        ],
      };

      const html = renderToStaticMarkup(<DocumentationTab {...propsWithAdditional} />);
      expect(html).toContain("laudo_tecnico_pericial.pdf");
      expect(html).toContain("512,0 KB");
      expect(html).toContain("Enviado em");
      expect(html).toContain("Baixar");
      expect(html).toContain("Arquivar");
      expect(html).not.toContain("Excluir");
    });

    it("renderiza o botão + Adicionar anexo complementar quando canManage=true", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} canManage={true} />);
      expect(html).toContain("+ Adicionar anexo complementar");
    });

    it("não renderiza o botão de upload complementar quando canManage=false", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} canManage={false} />);
      expect(html).not.toContain("+ Adicionar anexo complementar");
    });

    it("não renderiza Arquivar quando canUnlink=false", () => {
      const propsWithAdditional: DocumentationTabProps = {
        ...BASE_PROPS,
        canUnlink: false,
        documents: [
          ...BASE_PROPS.documents,
          {
            typeCode: "OUTRO",
            linkStatus: "active",
            uploadStatus: "confirmed",
            retentionState: "retained",
            id: "doc-outro-2",
            fileName: "minuta_convenio.pdf",
            size: 300000,
            createdAt: "2026-11-10T16:00:00Z",
          },
        ],
      };

      const html = renderToStaticMarkup(<DocumentationTab {...propsWithAdditional} />);
      expect(html).toContain("minuta_convenio.pdf");
      expect(html).toContain("Baixar");
      expect(html).not.toContain("Arquivar");
      expect(html).not.toContain("Excluir");
    });

    it("lista documentos arquivados na seção Arquivados", () => {
      const propsWithArchived: DocumentationTabProps = {
        ...BASE_PROPS,
        documents: [
          ...BASE_PROPS.documents,
          {
            typeCode: "DFD",
            linkStatus: "archived",
            uploadStatus: "confirmed",
            retentionState: "retained",
            id: "doc-dfd-old",
            fileName: "dfd_antigo.pdf",
            size: 1000,
            createdAt: "2026-10-01T10:00:00Z",
          },
        ],
      };
      const html = renderToStaticMarkup(<DocumentationTab {...propsWithArchived} />);
      expect(html).toContain("Arquivados");
      expect(html).toContain("dfd_antigo.pdf");
    });
  });
});
