import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { computeInitialEndDate } from "@/modules/atas/domain/validity";
import { formatDateOnly, maskBrDateInput, parseBrDateOnly, toFortalezaDate } from "@/shared/lib/time";
import { AtaValidityField } from "./ata-validity-field";

describe("parseBrDateOnly / maskBrDateInput", () => {
  it("aceita DD/MM/AAAA e dígitos sem barra", () => {
    expect(parseBrDateOnly("01/03/2026")).toBe("2026-03-01");
    expect(parseBrDateOnly("01032026")).toBe("2026-03-01");
    expect(parseBrDateOnly("31/02/2026")).toBeNull();
  });

  it("mascara progressivamente a digitação", () => {
    expect(maskBrDateInput("01")).toBe("01");
    expect(maskBrDateInput("0103")).toBe("01/03");
    expect(maskBrDateInput("01032026")).toBe("01/03/2026");
  });
});

describe("AtaValidityField", () => {
  it("mostra atalhos, campo brasileiro e vigência automática de 1 ano", () => {
    const today = toFortalezaDate(new Date());
    const html = renderToStaticMarkup(<AtaValidityField defaultStartDate={today} />);
    expect(html).toContain("Início da vigência");
    expect(html).toContain("Hoje");
    expect(html).toContain("1º deste mês");
    expect(html).toContain("DD/MM/AAAA");
    expect(html).toContain(`Vigência até`);
    expect(html).toContain(formatDateOnly(computeInitialEndDate(today)));
    expect(html).toContain(`name="startDate"`);
    expect(html).toContain(`value="${today}"`);
  });
});
