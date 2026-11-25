import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtaMaterialsValues } from "./ata-materials-values";

describe("AtaMaterialsValues", () => {
  it("mostra quantidade, valor total e unitário calculado", () => {
    const html = renderToStaticMarkup(
      <AtaMaterialsValues
        lines={[
          { materialId: "m1", name: "carro", quantity: 10 },
          { materialId: "m2", name: "Avião", quantity: 3 },
        ]}
        councilLabel="CRQ18"
        processLabel="015/2026 — Aquisições"
        defaultTotal={13000}
      />,
    );

    expect(html).toContain("2. Materiais e valores");
    expect(html).toContain("carro");
    expect(html).toContain("Qtd 10");
    expect(html).toContain("Avião");
    expect(html).toContain("Qtd 3");
    expect(html).toContain("Valor total do item");
    expect(html).toContain("Valor unitário");
    expect(html).toContain("Total da ata");
  });
});
