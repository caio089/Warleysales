import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/meetings/actions", () => ({
  scheduleMeetingFormAction: vi.fn(),
  meetingStepFormAction: vi.fn(),
  saveMinutesFormAction: vi.fn(),
  addActionItemFormAction: vi.fn(),
}));

import { MeetingDialog } from "./meeting-dialog";

describe("MeetingDialog", () => {
  it("renderiza botão de disparo padrão com acessibilidade", () => {
    const html = renderToStaticMarkup(
      <MeetingDialog councilId="123" councilLabel="CREA" />
    );
    expect(html).toContain("Agendar Reunião");
  });

  it("renderiza trigger customizado quando fornecido", () => {
    const html = renderToStaticMarkup(
      <MeetingDialog
        councilId="123"
        councilLabel="CREA"
        trigger={<button type="button">Custom Trigger Reunião</button>}
      />
    );
    expect(html).toContain("Custom Trigger Reunião");
    expect(html).not.toContain("Agendar Reunião");
  });
});
