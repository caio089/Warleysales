import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContractRepository } from "@/modules/contracts/repository";
import type { Contract } from "@/modules/contracts/schemas";
import { callRpc, selectAll, toDate, toIso, toNumber, unwrap } from "../db";

interface ContractRow {
  id: string;
  council_id: string;
  number: string;
  supplier_id: string | null;
  process_id?: string | null;
  object: string;
  start_date: string;
  end_date: string;
  value: number | string;
  created_at: string;
  contract_amendments: {
    sequence: number;
    reason: string;
    signed_at: string;
    previous_start_date: string;
    previous_end_date: string;
    previous_value: number | string;
    next_start_date: string;
    next_end_date: string;
    next_value: number | string;
  }[];
}

const SELECT = "*, contract_amendments(*)";

const toContract = (row: ContractRow): Contract => ({
  id: row.id,
  councilId: row.council_id,
  number: row.number,
  supplierId: row.supplier_id,
  processId: row.process_id ?? null,
  object: row.object,
  original: { startDate: row.start_date, endDate: row.end_date, value: toNumber(row.value) },
  amendments: [...row.contract_amendments].sort((a, b) => a.sequence - b.sequence).map((a) => ({
    sequence: a.sequence,
    reason: a.reason,
    signedAt: a.signed_at,
    previous: { startDate: a.previous_start_date, endDate: a.previous_end_date, value: toNumber(a.previous_value) },
    next: { startDate: a.next_start_date, endDate: a.next_end_date, value: toNumber(a.next_value) },
  })),
  createdAt: toDate(row.created_at),
});

const toPayload = (c: Contract) => ({
  id: c.id, council_id: c.councilId, number: c.number, supplier_id: c.supplierId, process_id: c.processId ?? null, object: c.object,
  start_date: c.original.startDate, end_date: c.original.endDate, value: c.original.value, created_at: toIso(c.createdAt),
  amendments: c.amendments.map((a) => ({
    sequence: a.sequence, reason: a.reason, signed_at: a.signedAt,
    previous_start_date: a.previous.startDate, previous_end_date: a.previous.endDate, previous_value: a.previous.value,
    next_start_date: a.next.startDate, next_end_date: a.next.endDate, next_value: a.next.value,
  })),
});

export class SupabaseContractRepository implements ContractRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(contract: Contract) {
    await callRpc(this.db, "save_contract", { p: toPayload(contract) });
    return contract;
  }

  /** Aditivos são append-only no banco (trigger + ON CONFLICT DO NOTHING); termos originais nunca mudam. */
  async save(contract: Contract) {
    await callRpc(this.db, "save_contract", { p: toPayload(contract) });
    return contract;
  }

  async findById(id: string) {
    const row = unwrap("contracts.find", await this.db.from("contracts").select(SELECT).eq("id", id).maybeSingle<ContractRow>());
    return row ? toContract(row) : null;
  }

  async listByCouncils(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<ContractRow>("contracts.list", (from, to) => {
      const query = this.db.from("contracts").select(SELECT).order("created_at", { ascending: false }).range(from, to);
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toContract);
  }
}
