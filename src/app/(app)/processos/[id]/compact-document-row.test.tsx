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

import { CompactDocumentRow, type CompactDocumentRowProps } from "./compact-document-row";

const VALID_ROW_PROPS: CompactDocumentRowProps = {
  processId: "proc-123",
  typeCode: "DFD",
  label: "1. Documento de Formalização da Demanda",
  valid: true,
  files: [
    {
      id: "doc-1",
      name: "dfd_assinado.pdf",
      size: 1572864, // ~1.5 MB
      createdAt: "2026-11-10T14:30:00Z",
    },
  ],
  canUpload: true,
  canUnlink: true,
  canManualDelete: false,
};

const PENDING_ROW_PROPS: CompactDocumentRowProps = {
  processId: "proc-123",
  typeCode: "ETP",
  label: "2. Estudo Técnico Preliminar",
  valid: false,
  files: [],
  canUpload: true,
  canUnlink: false,
  canManualDelete: false,
};

describe("CompactDocumentRow", () => {
  describe("Estado 1: Documento Válido / Anexado", () => {
    it("renderiza o rótulo legal e o typeCode", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...VALID_ROW_PROPS} />);
      expect(html).toContain("1. Documento de Formalização da Demanda");
      expect(html).toContain("DFD");
    });

    it("renderiza o indicador visual de documento válido", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...VALID_ROW_PROPS} />);
      expect(html).toContain('aria-label="Documento válido anexado"');
      expect(html).not.toContain("Pendente");
    });

    it("renderiza os arquivos anexados com nome, tamanho formatado e data", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...VALID_ROW_PROPS} />);
      expect(html).toContain("dfd_assinado.pdf");
      expect(html).toContain("1,5 MB");
      expect(html).toContain("Enviado em");
    });

    it("renderiza os botões Baixar e Desvincular quando canUnlink=true", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...VALID_ROW_PROPS} />);
      expect(html).toContain("Baixar");
      expect(html).toContain("Desvincular");
      expect(html).not.toContain("Excluir");
    });

    it("renderiza o botão Excluir definitivamente quando canManualDelete=true", () => {
      const html = renderToStaticMarkup(
        <CompactDocumentRow {...VALID_ROW_PROPS} canManualDelete={true} />,
      );
      expect(html).toContain("Excluir");
    });

    it("não renderiza Desvincular quando canUnlink=false", () => {
      const html = renderToStaticMarkup(
        <CompactDocumentRow {...VALID_ROW_PROPS} canUnlink={false} />,
      );
      expect(html).not.toContain("Desvincular");
    });

    it("não exibe a mensagem de pendência nem o dropzone gigante", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...VALID_ROW_PROPS} />);
      expect(html).not.toContain("Nenhum arquivo anexado para esta etapa legal.");
      expect(html).not.toContain("Arraste arquivos aqui");
    });

    it("renderiza múltiplos arquivos quando houver mais de um anexo", () => {
      const html = renderToStaticMarkup(
        <CompactDocumentRow
          {...VALID_ROW_PROPS}
          files={[
            {
              id: "doc-1",
              name: "dfd_v1.pdf",
              size: 1048576,
              createdAt: "2026-11-10T10:00:00Z",
            },
            {
              id: "doc-2",
              name: "dfd_v2_assinado.pdf",
              size: 2097152,
              createdAt: "2026-11-10T12:00:00Z",
            },
          ]}
        />,
      );
      expect(html).toContain("dfd_v1.pdf");
      expect(html).toContain("dfd_v2_assinado.pdf");
      expect(html).toContain("1,0 MB");
      expect(html).toContain("2,0 MB");
    });
  });

  describe("Estado 2: Documento Pendente", () => {
    it("renderiza o badge/indicador de Pendente", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...PENDING_ROW_PROPS} />);
      expect(html).toContain("Pendente");
      expect(html).not.toContain('aria-label="Documento válido anexado"');
    });

    it("renderiza a mensagem sutil informando ausência de arquivo", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...PENDING_ROW_PROPS} />);
      expect(html).toContain("Nenhum arquivo anexado para esta etapa legal.");
    });

    it("renderiza o botão + Anexar arquivo quando canUpload=true", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...PENDING_ROW_PROPS} />);
      expect(html).toContain("Anexar");
      expect(html).toContain("+ Anexar arquivo");
    });

    it("não renderiza o botão + Anexar arquivo quando canUpload=false", () => {
      const html = renderToStaticMarkup(
        <CompactDocumentRow {...PENDING_ROW_PROPS} canUpload={false} />,
      );
      expect(html).not.toContain("+ Anexar arquivo");
    });

    it("não renderiza botões Baixar nem Desvincular no estado pendente", () => {
      const html = renderToStaticMarkup(<CompactDocumentRow {...PENDING_ROW_PROPS} />);
      expect(html).not.toContain("Baixar");
      expect(html).not.toContain("Desvincular");
    });
  });
});
