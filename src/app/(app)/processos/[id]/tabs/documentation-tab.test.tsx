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
  isSpecialDeleter: true,
};

describe("DocumentationTab", () => {
  describe("Seção 1: Documentos Obrigatórios (Lei 14.133 / PNCP)", () => {
    it("renderiza o cabeçalho do card com título e texto contextual", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} />);
      expect(html).toContain("Documentos Obrigatórios (Lei 14.133 / PNCP)");
      expect(html).toContain("Itens necessários para alcançar 100% de conformidade e habilitar a contratação.");
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
      expect(html).toContain("6. Parecer Jurídico");
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
      expect(html).toContain("Desvincular");
      expect(html).toContain("Excluir");
    });

    it("renderiza o botão + Adicionar anexo complementar quando canManage=true", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} canManage={true} />);
      expect(html).toContain("+ Adicionar anexo complementar");
    });

    it("não renderiza o botão de upload complementar quando canManage=false", () => {
      const html = renderToStaticMarkup(<DocumentationTab {...BASE_PROPS} canManage={false} />);
      expect(html).not.toContain("+ Adicionar anexo complementar");
    });

    it("não renderiza botões de Desvincular e Excluir quando canUnlink=false e isSpecialDeleter=false", () => {
      const propsWithAdditional: DocumentationTabProps = {
        ...BASE_PROPS,
        canUnlink: false,
        isSpecialDeleter: false,
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
      // Na seção de artefatos adicionais, Desvincular e Excluir não devem aparecer
      // Note: CompactDocumentRow também não deve exibir Desvincular / Excluir
      expect(html).not.toContain("Desvincular");
      expect(html).not.toContain("Excluir");
    });
  });
});
