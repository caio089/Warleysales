import { CalendarPlus } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActionHub, buildCouncilActions } from "./action-hub";

describe("ActionHub", () => {
  it("renderiza atalhos rápidos compactos", () => {
    const items = buildCouncilActions({
      councilId: "c1",
      canCreateRequest: true,
      canCreateProcess: true,
      canManageMeeting: true,
    });
    const html = renderToStaticMarkup(<ActionHub items={items} />);
    expect(html).toContain("Nova solicitação");
    expect(html).toContain("Novo processo");
    expect(html).toContain("Agendar reunião");
    expect(html).toContain("Ver estoque");
    expect(html).toContain("Solicitações");
    expect(html).toContain("Atas de preços");

    // Layout em grid compacto
    expect(html).toContain("lg:grid-cols-6");
    expect(html).toContain("size-8");
  });

  it("respeita permissões desabilitadas", () => {
    const items = buildCouncilActions({
      councilId: "c1",
      canCreateRequest: false,
      canCreateProcess: false,
      canManageMeeting: false,
    });
    const html = renderToStaticMarkup(<ActionHub items={items} />);
    expect(html).toContain("aria-disabled=\"true\"");
  });

  it("renderiza botão interativo quando onClick é fornecido", () => {
    const items = [
      {
        href: "#dialog",
        title: "Agendar reunião",
        detail: "Abrir modal",
        icon: CalendarPlus,
        onClick: () => {},
      },
    ];
    const html = renderToStaticMarkup(<ActionHub items={items} />);
    expect(html).toContain("<button");
    expect(html).toContain("type=\"button\"");
    expect(html).toContain("Agendar reunião");
  });

  it("renderiza renderMeetingTrigger customizado em buildCouncilActions", () => {
    const items = buildCouncilActions({
      councilId: "c1",
      canCreateRequest: true,
      canCreateProcess: true,
      canManageMeeting: true,
      renderMeetingTrigger: (className, body) => (
        <button type="button" data-custom-trigger="true" className={className}>
          {body}
        </button>
      ),
    });
    const html = renderToStaticMarkup(<ActionHub items={items} />);
    expect(html).toContain("data-custom-trigger=\"true\"");
    expect(html).toContain("Agendar reunião");
    expect(html).not.toContain("#agendar-reuniao");
  });
});
