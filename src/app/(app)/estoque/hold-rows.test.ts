import { describe, expect, it } from "vitest";
import { buildHoldRows } from "./hold-rows";

describe("linhas de solicitação no estoque", () => {
  it("não soma 100 e 50 em um único 150", () => {
    const rows = buildHoldRows(
      [{
        id: "req-1",
        title: "Demanda de teste",
        councilId: "org-1",
        processId: "proc-1",
        status: "bloqueado",
        items: [
          { materialId: "m-a", quantity: 100 },
          { materialId: "m-b", quantity: 50 },
        ],
      }],
      {
        council: { "org-1": "CRCPI" },
        material: { "m-a": "Papel A4", "m-b": "Caneta azul" },
      },
    );

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.quantity)).toEqual([100, 50]);
    expect(rows.map((row) => row.quantityLabel)).toEqual(["100 un", "50 un"]);
    expect(rows[0]?.name).toBe("Papel A4");
    expect(rows[1]?.name).toBe("Caneta azul");
    expect(rows.every((row) => row.demand === "Demanda de teste")).toBe(true);
  });
});
