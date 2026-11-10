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
  usePathname: () => "/processos",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/modules/documents/actions", () => ({
  loadProcessDocumentsAction: vi.fn(),
  downloadUrlAction: vi.fn(),
  prepareDocumentUploadAction: vi.fn(),
  confirmDocumentUploadAction: vi.fn(),
}));

import { openProcessAttachment, ProcessAttachmentSheet } from "./process-attachment-sheet";

describe("ProcessAttachmentSheet", () => {
  it("renderiza o container do Sheet", () => {
    const html = renderToStaticMarkup(<ProcessAttachmentSheet processId={null} />);
    expect(html).toBeDefined();
  });

  it("openProcessAttachment manipula history e despacha evento customizado quando window existe", () => {
    const dispatchMock = vi.fn();
    const pushStateMock = vi.fn();
    (globalThis as unknown as { window: unknown }).window = {
      location: { href: "http://localhost:3000/processos" },
      history: { pushState: pushStateMock },
      dispatchEvent: dispatchMock,
    };
    (globalThis as unknown as { CustomEvent: unknown }).CustomEvent = class {
      detail: unknown;
      constructor(public type: string, init?: { detail?: unknown }) {
        this.detail = init?.detail;
      }
    };
    try {
      openProcessAttachment("proc-test-123");
      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(pushStateMock).toHaveBeenCalledTimes(1);
    } finally {
      delete (globalThis as unknown as { window?: unknown }).window;
      delete (globalThis as unknown as { CustomEvent?: unknown }).CustomEvent;
    }
  });
});
