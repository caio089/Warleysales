import type { SupabaseClient } from "@supabase/supabase-js";
import { idSchema } from "@/shared/lib/service-support";
import type { ContractRepository } from "@/modules/contracts/repository";
import type { Contract } from "@/modules/contracts/schemas";
import { fail } from "@/shared/lib/result";
import { callRpc, DatabaseError, rpcOutcomeToResult, selectAll, toDate, toIso, toNumber, unwrap, type RpcOutcome } from "../db";

interface ContractRow {
  closed_at?: string | null;
  closed_by?: string | null;
  id: string;
  council_id: string;
  number: string;
  supplier_id: string | null;
  process_id?: string | null;
  ata_id?: string | null;
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
  contract_ata_items?: {
    id: string;
    ata_item_id: string;
    quantity: number | string;
    unit_price: number | string;
  }[];
}

const SELECT = "*, contract_amendments(*), contract_ata_items(*)";

const toContract = (row: ContractRow): Contract => ({
  closedAt: row.closed_at ? toDate(row.closed_at) : null,
  closedBy: row.closed_by ?? null,
  id: row.id,
  councilId: row.council_id,
  number: row.number,
  supplierId: row.supplier_id,
  processId: row.process_id ?? null,
  ataId: row.ata_id ?? null,
  object: row.object,
  original: { startDate: row.start_date, endDate: row.end_date, value: toNumber(row.value) },
  amendments: [...row.contract_amendments].sort((a, b) => a.sequence - b.sequence).map((a) => ({
    sequence: a.sequence,
    reason: a.reason,
    signedAt: a.signed_at,
    previous: { startDate: a.previous_start_date, endDate: a.previous_end_date, value: toNumber(a.previous_value) },
    next: { startDate: a.next_start_date, endDate: a.next_end_date, value: toNumber(a.next_value) },
  })),
  ataItems: (row.contract_ata_items ?? []).map((item) => ({
    id: item.id,
    ataItemId: item.ata_item_id,
    quantity: toNumber(item.quantity),
    unitPrice: toNumber(item.unit_price),
  })),
  createdAt: toDate(row.created_at),
});

const toPayload = (c: Contract) => ({
  id: c.id,
  council_id: c.councilId,
  number: c.number,
  supplier_id: c.supplierId,
  process_id: c.processId ?? null,
  ata_id: c.ataId ?? null,
  object: c.object,
  start_date: c.original.startDate,
  end_date: c.original.endDate,
  value: c.original.value,
  created_at: toIso(c.createdAt),
  amendments: c.amendments.map((a) => ({
    sequence: a.sequence,
    reason: a.reason,
    signed_at: a.signedAt,
    previous_start_date: a.previous.startDate,
    previous_end_date: a.previous.endDate,
    previous_value: a.previous.value,
    next_start_date: a.next.startDate,
    next_end_date: a.next.endDate,
    next_value: a.next.value,
  })),
  ata_items: (c.ataItems ?? []).map((item) => ({
    id: item.id,
    ata_item_id: item.ataItemId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  })),
});

export class SupabaseContractRepository implements ContractRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listReceiptLines(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<{ request_id: string; receipt_key: string; request_item_id: string; contract_id: string; ata_item_id: string | null; quantity: number | string }>("contracts.receipts", (from, to) =>
      this.db.from("contract_receipt_lines")
        .select("request_id, receipt_key, request_item_id, contract_id, ata_item_id, quantity")
        .order("request_id").order("receipt_key").order("request_item_id").range(from, to));
    if (councilIds === "all") return rows.map((row) => ({ requestId: row.request_id, receiptKey: row.receipt_key, requestItemId: row.request_item_id, contractId: row.contract_id, ataItemId: row.ata_item_id, quantity: toNumber(row.quantity) }));
    const contracts = await this.listByCouncils(councilIds);
    const visible = new Set(contracts.map((contract) => contract.id));
    return rows.filter((row) => visible.has(row.contract_id)).map((row) => ({ requestId: row.request_id, receiptKey: row.receipt_key, requestItemId: row.request_item_id, contractId: row.contract_id, ataItemId: row.ata_item_id, quantity: toNumber(row.quantity) }));
  }

  async close(id: string, actorId: string, at: Date) {
    const row = unwrap("contracts.close", await this.db.from("contracts")
      .update({ closed_at: toIso(at), closed_by: actorId }).eq("id", id).is("closed_at", null)
      .select(SELECT).maybeSingle<ContractRow>());
    return row ? toContract(row) : null;
  }

  async insertAtomically(contract: Contract) {
    try {
      const outcome = await callRpc<RpcOutcome>(this.db, "create_contract_with_ata", { p: toPayload(contract) });
      const result = rpcOutcomeToResult(outcome);
      return result.ok ? { ok: true as const, data: contract } : result;
    } catch (error) {
      if (error instanceof DatabaseError && error.code === "23505") {
        return fail("CONFLICT", "Já existe contrato com este número neste órgão. Informe outro número.", {
          number: ["Escolha um número diferente do contrato já cadastrado."],
        });
      }
      throw error;
    }
  }

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

  async listByCouncils(councilIds: readonly string[] | "all", process?: { id: string; councilId: string }) {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<ContractRow>("contracts.list", (from, to) => {
      let query = this.db.from("contracts").select(SELECT).order("created_at", { ascending: false }).range(from, to);
      if (process) {
        const processId = idSchema.parse(process.id);
        const councilId = idSchema.parse(process.councilId);
        query = query.or(`process_id.eq.${processId},and(process_id.is.null,council_id.eq.${councilId})`);
      }
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toContract);
  }
}
