import { describe, expect, it } from "vitest";
import {
  buildRequestExcelTemplate,
  parseRequestTemplateMatrix,
  spreadsheetToMatrix,
  TEMPLATE_HEADERS,
} from "./request-template";
import { tryParseExcelTemplate } from "./request-template-parse";

describe("modelo de solicitação multi-itens", () => {
  it("gera Excel com cabeçalhos oficiais e exemplos", () => {
    const bytes = buildRequestExcelTemplate();
    const matrix = spreadsheetToMatrix(bytes);
    const flat = matrix.flat().map(String);
    expect(flat).toContain(TEMPLATE_HEADERS.title);
    expect(flat).toContain(TEMPLATE_HEADERS.item);
    expect(flat).toContain(TEMPLATE_HEADERS.quantity);
    expect(flat).toContain(TEMPLATE_HEADERS.unit);
  });

  it("compara a tabela do modelo e preenche vários itens de uma vez", () => {
    const bytes = buildRequestExcelTemplate();
    const parsed = tryParseExcelTemplate(bytes);
    expect(parsed?.items).toHaveLength(2);
    expect(parsed?.items.map((item) => item.quantity)).toEqual([100, 50]);
    expect(parsed?.items[0]?.description).toBe("Papel A4");
    expect(parsed?.items[1]?.description).toBe("Caneta azul");
  });

  it("aceita aliases de coluna e metadados Título/Valor", () => {
    const parsed = parseRequestTemplateMatrix([
      ["Título", "Material de limpeza CRC"],
      ["Valor estimado (R$)", "1234,50"],
      [],
      ["Produto", "Qtd", "Un"],
      ["Detergente", "20", "L"],
      ["Álcool 70%", "10", "un"],
      ["Esponja", "5", "pct"],
    ]);
    expect(parsed).toMatchObject({
      title: "Material de limpeza CRC",
      estimatedValue: 1234.5,
    });
    expect(parsed?.items).toHaveLength(3);
  });

  it("ignora linhas vazias e rejeita tabela sem cabeçalho", () => {
    expect(parseRequestTemplateMatrix([["a", "b"], ["c", "d"]])).toBeNull();
    const parsed = parseRequestTemplateMatrix([
      ["Item", "Quantidade", "Unidade"],
      ["", "", ""],
      ["Papel", "3", "un"],
    ]);
    expect(parsed?.items).toHaveLength(1);
  });
});
