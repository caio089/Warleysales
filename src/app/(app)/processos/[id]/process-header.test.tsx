import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/shared/lib/format";
import { ProcessHeader, type ProcessHeaderProps } from "./process-header";

const BASE_PROPS: ProcessHeaderProps = {
  processNumber: "23000.000123/2026-01",
  productName: "Resina Composta Fotopolimerizável",
  description: "Aquisição de resinas e insumos para clínicas odontológicas",
  statusLabel: "Em Instrução",
  statusTone: "info",
  completionLabel: "Em Andamento",
  completionTone: "warning",
  initialValue: 85000,
  quantity: 250,
  validTypesCount: 5,
  totalTypesCount: 7,
  displayPercent: 71,
  releaseStatusText: "Falta homologação",
};

describe("ProcessHeader", () => {
  it("renderiza link de retorno para a listagem de processos", () => {
    const html = renderToStaticMarkup(<ProcessHeader {...BASE_PROPS} />);
    expect(html).toContain('href="/processos"');
    expect(html).toContain("Voltar para Processos");
  });

  it("renderiza o número do processo no eyebrow e título do produto em h1 sem barra laranja", () => {
    const html = renderToStaticMarkup(<ProcessHeader {...BASE_PROPS} />);
    expect(html).toContain("Processo 23000.000123/2026-01");
    expect(html).toContain("<h1");
    expect(html).toContain("Resina Composta Fotopolimerizável");
    expect(html).toContain("Aquisição de resinas e insumos para clínicas odontológicas");
    // Garante que não possui a barra laranja pesada (bg-highlight)
    expect(html).not.toContain("bg-highlight");
  });

  it("renderiza os badges de status administrativo e conclusão documental", () => {
    const html = renderToStaticMarkup(<ProcessHeader {...BASE_PROPS} />);
    expect(html).toContain("Em Instrução");
    expect(html).toContain("Em Andamento");
  });

  it("renderiza os 4 cards de métricas com valores válidos", () => {
    const html = renderToStaticMarkup(<ProcessHeader {...BASE_PROPS} />);

    // Card 1: Valor Estimado
    expect(html).toContain("Valor Estimado");
    expect(html).toContain(formatCurrency(85000));

    // Card 2: Quantidade
    expect(html).toContain("Quantidade");
    expect(html).toContain("250");

    // Card 3: Conformidade Documental
    expect(html).toContain("Conformidade Documental");
    expect(html).toContain("5/7 (71%)");

    // Card 4: Status de Liberação
    expect(html).toContain("Status de Liberação");
    expect(html).toContain("Falta homologação");
  });

  it("exibe 'A definir' quando initialValue for nulo", () => {
    const html = renderToStaticMarkup(
      <ProcessHeader {...BASE_PROPS} initialValue={null} />,
    );
    expect(html).toContain("A definir");
  });

  it("exibe travessão quando a quantidade for zero", () => {
    const html = renderToStaticMarkup(
      <ProcessHeader {...BASE_PROPS} quantity={0} />,
    );
    expect(html).toContain("—");
  });

  it("inclui mini barra de progresso horizontal com acessibilidade", () => {
    const html = renderToStaticMarkup(
      <ProcessHeader {...BASE_PROPS} displayPercent={71} />,
    );
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="71"');
    expect(html).toContain('style="width:71%"');
  });
});
