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

import { AdditionalDocumentsCard } from "./document-card";

describe("AdditionalDocumentsCard", () => {
  it("exibe estado vazio quando não há documentos adicionais", () => {
    const html = renderToStaticMarkup(
      <AdditionalDocumentsCard
        processId="proc-1"
        docs={[]}
        canUpload={false}
        canUnlink={false}
        canManualDelete={false}
      />,
    );
    expect(html).toContain("Artefatos Adicionais &amp; Complementares");
    expect(html).toContain("Nenhum artefato adicional anexado.");
    expect(html).toContain("0 documentos");
  });

  it("renderiza lista de documentos complementares com tamanho e data", () => {
    const html = renderToStaticMarkup(
      <AdditionalDocumentsCard
        processId="proc-1"
        docs={[
          {
            id: "doc-1",
            name: "laudo-pericial.pdf",
            size: 2048576,
            createdAt: new Date("2026-11-10T15:30:00Z"),
          },
          {
            id: "doc-2",
            name: "minuta-contratual.docx",
            size: 102400,
            createdAt: new Date("2026-11-10T16:00:00Z"),
          },
        ]}
        canUpload={true}
        canUnlink={true}
        canManualDelete={false}
      />,
    );
    expect(html).toContain("laudo-pericial.pdf");
    expect(html).toContain("minuta-contratual.docx");
    expect(html).toContain("2,0 MB");
    expect(html).toContain("100,0 KB");
    expect(html).toContain("Baixar");
    expect(html).toContain("Desvincular");
    expect(html).toContain("Anexar artefato complementar");
    expect(html).toContain("2 documentos");
  });
});
