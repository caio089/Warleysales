import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RequestsOverview, ProcessesOverview, MeetingsOverview } from "./overview-lists";

describe("Meu Painel Overview Lists", () => {
  it("renderiza listas com empty states compactos e sem quebras", () => {
    const htmlReq = renderToStaticMarkup(<RequestsOverview rows={[]} />);
    expect(htmlReq).toContain("Solicitações");
    expect(htmlReq).toContain("Nenhuma solicitação");

    const htmlProc = renderToStaticMarkup(<ProcessesOverview rows={[]} />);
    expect(htmlProc).toContain("Processos e documentos");

    const htmlMeet = renderToStaticMarkup(<MeetingsOverview rows={[]} />);
    expect(htmlMeet).toContain("Reuniões");
  });

  it("renderiza ação customizada no cabeçalho quando fornecida", () => {
    const htmlMeet = renderToStaticMarkup(
      <MeetingsOverview rows={[]} action={<button type="button">Agendar Teste</button>} />,
    );
    expect(htmlMeet).toContain("Agendar Teste");
  });
});
