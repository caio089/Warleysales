import { describe, expect, it } from "vitest";
import type { AtaView } from "@/modules/atas/service";
import type { Contract } from "@/modules/contracts/schemas";
import { buildHoldRows, contractedMaterialsByProcess } from "./hold-rows";

describe("linhas de solicitação no estoque", () => {
  it("identifica o material contratado pelo item da ata, sem avançar os demais materiais", () => {
    const ata = { ata: { id: "ata", status: "vigente", items: [{ id: "item-a", materialId: "m-a" }] } } as AtaView;
    const contract = { councilId: "org-1", processId: "proc-1", ataId: "ata",
      ataItems: [{ ataItemId: "item-a", quantity: 5 }] } as Contract;
    expect(contractedMaterialsByProcess([contract], [ata]).get("org-1:proc-1")).toEqual(new Set(["m-a"]));
    expect(contractedMaterialsByProcess([{ ...contract, ataId: null, ataItems: [] }], []).get("org-1:proc-1")).toBe("all");
    expect(contractedMaterialsByProcess([contract], [{ ...ata, ata: { ...ata.ata, status: "cancelada" } }]).size).toBe(0);
  });
  it("não soma 100 e 50 em um único 150", () => {
    const rows = buildHoldRows(
      [{
        id: "req-1",
        title: "Demanda de teste",
        councilId: "org-1",
        processId: "proc-1",
        status: "bloqueado",
        items: [
          { materialId: "m-a", quantity: 100, status: "contratado" },
          { materialId: "m-b", quantity: 50 },
        ],
      }],
      {
        council: { "org-1": "CRCPI" },
        material: { "m-a": "Papel A4", "m-b": "Caneta azul" },
      },
    );

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.status)).toEqual(["contratado", "bloqueado"]);
    expect(rows.map((row) => row.quantity)).toEqual([100, 50]);
    expect(rows.map((row) => row.quantityLabel)).toEqual(["100 un", "50 un"]);
    expect(rows[0]?.name).toBe("Papel A4");
    expect(rows[1]?.name).toBe("Caneta azul");
    expect(rows.every((row) => row.demand === "Demanda de teste")).toBe(true);
  });

  it("mostra saldo da ata, do contrato e aviso quando o contrato esgota", () => {
    const [row] = buildHoldRows([{
      id: "req-1", title: "Cadeiras", councilId: "org-1", processId: "proc-1", status: "contratado",
      items: [{ materialId: "cadeira", quantity: 10, ataTotal: 50, ataBalance: 20, contractTotal: 10, contractBalance: 0, stockBalance: 10 }],
    }], { council: { "org-1": "CRCPI" }, material: { cadeira: "Cadeiras" } });
    expect(row).toMatchObject({ ataTotal: 50, ataBalance: 20, contractTotal: 10, contractBalance: 0, stockBalance: 10, balanceNotice: "Contrato esgotado" });
  });
});
