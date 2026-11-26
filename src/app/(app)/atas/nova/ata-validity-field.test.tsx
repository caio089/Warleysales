import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { computeInitialEndDate } from "@/modules/atas/domain/validity";
import { formatDateOnly, maskBrDateInput, parseBrDateOnly, toFortalezaDate } from "@/shared/lib/time";
import { AtaValidityField, validStartDateFromInput } from "./ata-validity-field";

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
  it("limpa o valor enviado quando a data visível fica incompleta ou inválida", () => {
    expect(validStartDateFromInput("01/03/2026")).toBe("2026-03-01");
    expect(validStartDateFromInput("01/03/202")).toBe("");
    expect(validStartDateFromInput("31/02/2026")).toBe("");
  });
  it("tem um único campo de início e mostra o fim de 1 ano calculado", () => {
    const today = toFortalezaDate(new Date());
    const html = renderToStaticMarkup(<AtaValidityField />);
    expect(html).toContain("Padrão 1 ano (hoje)");
    expect(html).toContain("1º deste mês");
    expect(html).toContain("DD/MM/AAAA");
    expect(html).toContain("Início da vigência");
    expect(html).toContain(formatDateOnly(today));
    expect(html).toContain(formatDateOnly(computeInitialEndDate(today)));
    expect(html).toContain(`name="startDate"`);
    expect(html).toContain(`value="${today}"`);
    // Não deve haver o segundo campo type=date duplicado
    expect(html).not.toContain('type="date"');
  });
});
