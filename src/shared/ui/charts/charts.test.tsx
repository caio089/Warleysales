import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BarStatList } from "./bar-stat-list";
import { DonutChart } from "./donut-chart";

describe("DonutChart", () => {
  it("renderiza total no centro e fatias na legenda", () => {
    const html = renderToStaticMarkup(
      <DonutChart
        centerLabel="Pedidos"
        centerValue={12}
        slices={[
          { id: "a", label: "Aguardando", value: 5, color: "#0f2942" },
          { id: "b", label: "Em andamento", value: 4, color: "#f59e0b" },
          { id: "c", label: "Concluídos", value: 3, color: "#10b981" },
        ]}
      />,
    );
    expect(html).toContain("Pedidos");
    expect(html).toContain("12");
    expect(html).toContain("Aguardando");
    expect(html).toContain("Concluídos");
  });
});

describe("BarStatList", () => {
  it("renderiza barras e empty state", () => {
    const empty = renderToStaticMarkup(<BarStatList items={[]} />);
    expect(empty).toContain("Nada para mostrar agora.");

    const filled = renderToStaticMarkup(
      <BarStatList
        items={[
          { id: "1", label: "Em andamento", value: 8, barClassName: "bg-primary" },
          { id: "2", label: "Concluídos", value: 3, barClassName: "bg-emerald-500" },
        ]}
      />,
    );
    expect(filled).toContain("Em andamento");
    expect(filled).toContain("8");
  });
});
