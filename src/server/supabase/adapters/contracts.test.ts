import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Contract } from "@/modules/contracts/schemas";
import { SupabaseContractRepository } from "./contracts";

describe("cadastro de contrato no Supabase", () => {
  it("explica a duplicação do número no órgão sem expor o erro SQL", async () => {
    const db = {
      rpc: async () => ({ data: null, error: { code: "23505", message: "duplicate key value violates unique constraint contracts_council_id_number_key" } }),
    } as unknown as SupabaseClient;
    const contract = {
      id: "contract-1", councilId: "council-1", number: "CTR 002/2026", supplierId: null,
      processId: "process-1", ataId: "ata-2", object: "Cadeiras",
      original: { startDate: "2026-11-27", endDate: "2027-11-26", value: 700 },
      amendments: [], ataItems: [], createdAt: new Date("2026-11-27T12:00:00Z"),
    } as Contract;

    expect(await new SupabaseContractRepository(db).insertAtomically(contract)).toEqual({
      ok: false,
      code: "CONFLICT",
      message: "Já existe contrato com este número neste órgão. Informe outro número.",
      fieldErrors: { number: ["Escolha um número diferente do contrato já cadastrado."] },
    });
  });
});
