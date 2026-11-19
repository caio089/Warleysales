import { describe, expect, it } from "vitest";
import {
  buildRequestExcelTemplate,
  parseRequestTemplateMatrix,
  spreadsheetToMatrix,
  TEMPLATE_HEADERS,
} from "./request-template";
import { tryParseExcelTemplate } from "./request-template-parse";

describe("modelo de solicitação multi-itens", () => {
  it("gera Excel com cabeçalhos oficiais, aba de instruções e sem itens de exemplo na aba principal", () => {
    const bytes = buildRequestExcelTemplate();
    const matrix = spreadsheetToMatrix(bytes);
    const flat = matrix.flat().map(String);
    expect(flat).toContain(TEMPLATE_HEADERS.title);
    expect(flat).toContain(TEMPLATE_HEADERS.item);
    expect(flat).toContain(TEMPLATE_HEADERS.quantity);
    expect(flat).toContain(TEMPLATE_HEADERS.unit);
    expect(flat.join(" ")).toMatch(/MODELO DE SOLICITAÇÃO/);
    // Modelo vazio não importa lixo: sem linhas preenchidas na aba Solicitação.
    expect(tryParseExcelTemplate(bytes)).toBeNull();
  });

  it("compara a tabela preenchida e importa vários itens de uma vez", () => {
    const parsed = parseRequestTemplateMatrix([
      ["MODELO DE SOLICITAÇÃO — Warley"],
      [TEMPLATE_HEADERS.title, "Material de escritório"],
      [TEMPLATE_HEADERS.estimatedValue, "1500"],
      [TEMPLATE_HEADERS.item, TEMPLATE_HEADERS.quantity, TEMPLATE_HEADERS.unit],
      ["Papel A4", 100, "resma"],
      ["Caneta azul", 50, "un"],
    ]);
    expect(parsed?.title).toBe("Material de escritório");
    expect(parsed?.estimatedValue).toBe(1500);
    expect(parsed?.items).toHaveLength(2);
    expect(parsed?.items.map((item) => item.quantity)).toEqual([100, 50]);
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
