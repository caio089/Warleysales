import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransferStatus } from "@/modules/transfers/domain/transfer";
import type { TransferRepository } from "@/modules/transfers/repository";
import type { Transfer } from "@/modules/transfers/schemas";
import { callRpc, selectAll, toDate, toIso, toNumber, unwrap } from "../db";

interface TransferRow {
  id: string;
  origin_council_id: string;
  destination_council_id: string;
  status: TransferStatus;
  created_at: string;
  stock_transfer_items: { seq: number; material_id: string; quantity: number | string; received_quantity: number | string | null }[];
  stock_transfer_events: { position: number; from_status: TransferStatus | null; to_status: TransferStatus; actor_id: string; at: string; note: string | null }[];
}

const SELECT = "*, stock_transfer_items(*), stock_transfer_events(*)";

const toTransfer = (row: TransferRow): Transfer => ({
  id: row.id,
  originCouncilId: row.origin_council_id,
  destinationCouncilId: row.destination_council_id,
  status: row.status,
  createdAt: toDate(row.created_at),
  items: [...row.stock_transfer_items].sort((a, b) => a.seq - b.seq).map((i) => ({
    materialId: i.material_id, quantity: toNumber(i.quantity), receivedQuantity: i.received_quantity === null ? null : toNumber(i.received_quantity),
  })),
  events: [...row.stock_transfer_events].sort((a, b) => a.position - b.position).map((e) => ({
    from: e.from_status, to: e.to_status, actorId: e.actor_id, at: toDate(e.at), ...(e.note ? { note: e.note } : {}),
  })),
});

const toPayload = (t: Transfer) => ({
  id: t.id, origin_council_id: t.originCouncilId, destination_council_id: t.destinationCouncilId, status: t.status, created_at: toIso(t.createdAt),
  items: t.items.map((i) => ({ material_id: i.materialId, quantity: i.quantity, received_quantity: i.receivedQuantity })),
  events: t.events.map((e) => ({ from_status: e.from, to_status: e.to, actor_id: e.actorId, at: toIso(e.at), note: e.note ?? null })),
});

export class SupabaseTransferRepository implements TransferRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(transfer: Transfer) {
    await callRpc(this.db, "save_transfer", { p: toPayload(transfer) });
    return transfer;
  }

  async save(transfer: Transfer) {
    await callRpc(this.db, "save_transfer", { p: toPayload(transfer) });
    return transfer;
  }

  async findById(id: string) {
    const row = unwrap("transfers.find", await this.db.from("stock_transfers").select(SELECT).eq("id", id).maybeSingle<TransferRow>());
    return row ? toTransfer(row) : null;
  }

  async listByCouncils(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<TransferRow>("transfers.list", (from, to) => {
      const query = this.db.from("stock_transfers").select(SELECT).order("created_at", { ascending: false }).range(from, to);
      // Visível para origem e destino (mesma regra da política RLS).
      return councilIds === "all"
        ? query
        : query.or(`origin_council_id.in.(${councilIds.join(",")}),destination_council_id.in.(${councilIds.join(",")})`);
    });
    return rows.map(toTransfer);
  }
}
