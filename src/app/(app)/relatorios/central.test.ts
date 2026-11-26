import { describe, expect, it } from "vitest";
import { parseDetailedFilter } from "@/modules/reports/detailed-filter";

describe("filtros da central de relatórios", () => {
  it("combina filtros válidos sem aceitar IDs ou datas malformados", () => {
    expect(parseDetailedFilter({ kind: "processos", start: "2026-11-01", end: "2026-11-30", dateBasis: "movimentacao", councilId: "bad", status: "concluido" })).toMatchObject({ kind: "processos", start: "2026-11-01", end: "2026-11-30", dateBasis: "movimentacao", councilId: undefined, status: "concluido" });
  });
  it("não inventa uma categoria para um tipo desconhecido", () => {
    expect(parseDetailedFilter({ kind: "desconhecido" }).kind).toBe("processos");
  });
  it("mantém o colaborador selecionado", () => {
    expect(parseDetailedFilter({ kind: "colaborador", actorId: "11111111-1111-4111-8111-111111111111" }).actorId).toBe("11111111-1111-4111-8111-111111111111");
  });
  it("interpreta o mês sem substituir outros filtros", () => {
    expect(parseDetailedFilter({ kind: "estagiarios", month: "2026-02", councilId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" })).toMatchObject({ start: "2026-02-01", end: "2026-02-28", councilId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" });
  });
});
