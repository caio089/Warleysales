import type { SupabaseClient } from "@supabase/supabase-js";
import type { PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import type { PurchaseRequestRepository } from "@/modules/purchases/repository";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import { callRpc, selectAll, toDate, toIso, toNumber, unwrap } from "../db";

interface RequestRow {
  id: string;
  council_id: string;
  title: string;
  status: PurchaseRequestStatus;
  created_by: string;
  created_at: string;
  purchase_request_items: {
    id: string;
    seq: number;
    material_id: string;
    quantity: number | string;
    ata_item_id: string | null;
    received_total: number | string;
  }[];
  purchase_request_events: {
    position: number;
    from_status: PurchaseRequestStatus | null;
    to_status: PurchaseRequestStatus;
    actor_id: string;
    at: string;
    note: string | null;
  }[];
  purchase_receipt_keys: { receipt_key: string }[];
}

const SELECT = "*, purchase_request_items(*), purchase_request_events(*), purchase_receipt_keys(receipt_key)";

const toRequest = (row: RequestRow): PurchaseRequest => ({
  id: row.id,
  councilId: row.council_id,
  title: row.title,
  status: row.status,
  createdBy: row.created_by,
  createdAt: toDate(row.created_at),
  items: [...row.purchase_request_items].sort((a, b) => a.seq - b.seq).map((i) => ({
    id: i.id, materialId: i.material_id, quantity: toNumber(i.quantity), ataItemId: i.ata_item_id, receivedTotal: toNumber(i.received_total),
  })),
  events: [...row.purchase_request_events].sort((a, b) => a.position - b.position).map((e) => ({
    from: e.from_status, to: e.to_status, actorId: e.actor_id, at: toDate(e.at), ...(e.note ? { note: e.note } : {}),
  })),
  receiptKeys: row.purchase_receipt_keys.map((k) => k.receipt_key),
});

const toPayload = (r: PurchaseRequest) => ({
  id: r.id, council_id: r.councilId, title: r.title, status: r.status, created_by: r.createdBy, created_at: toIso(r.createdAt),
  items: r.items.map((i) => ({ id: i.id, material_id: i.materialId, quantity: i.quantity, ata_item_id: i.ataItemId, received_total: i.receivedTotal })),
  events: r.events.map((e) => ({ from_status: e.from, to_status: e.to, actor_id: e.actorId, at: toIso(e.at), note: e.note ?? null })),
  receipt_keys: r.receiptKeys,
});

export class SupabasePurchaseRequestRepository implements PurchaseRequestRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(request: PurchaseRequest) {
    await callRpc(this.db, "save_purchase_request", { p: toPayload(request) });
    return request;
  }

  async save(request: PurchaseRequest) {
    await callRpc(this.db, "save_purchase_request", { p: toPayload(request) });
    return request;
  }

  async findById(id: string) {
    const row = unwrap("requests.find", await this.db.from("purchase_requests").select(SELECT).eq("id", id).maybeSingle<RequestRow>());
    return row ? toRequest(row) : null;
  }

  async listByCouncils(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<RequestRow>("requests.list", (from, to) => {
      const query = this.db.from("purchase_requests").select(SELECT).order("created_at", { ascending: false }).range(from, to);
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toRequest);
  }
}
