import type { SupabaseClient } from "@supabase/supabase-js";
import type { MaterialOrderFilter, MaterialOrderRepository } from "@/modules/orders/repository";
import type { MaterialOrder, MaterialOrderItem, MaterialOrderStatus } from "@/modules/orders/schemas";
import { selectAll, toDate, toIso, toNumber, unwrap } from "../db";

interface OrderItemRow {
  id: string;
  order_id: string;
  material_id: string;
  quantity: number | string;
}

interface OrderRow {
  id: string;
  number: string;
  council_id: string;
  status: string;
  requested_by: string;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  material_order_items: OrderItemRow[];
}

const SELECT = "*, material_order_items(*)";

const toOrder = (row: OrderRow): MaterialOrder => ({
  id: row.id,
  number: row.number,
  councilId: row.council_id,
  status: row.status as MaterialOrderStatus,
  requestedBy: row.requested_by,
  notes: row.notes,
  reviewedBy: row.reviewed_by,
  reviewedAt: row.reviewed_at ? toDate(row.reviewed_at) : null,
  rejectionReason: row.rejection_reason,
  items: (row.material_order_items ?? []).map((i) => ({
    id: i.id,
    orderId: i.order_id,
    materialId: i.material_id,
    quantity: toNumber(i.quantity),
  })),
  createdAt: toDate(row.created_at),
  updatedAt: toDate(row.updated_at),
});

export class SupabaseMaterialOrderRepository implements MaterialOrderRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(order: MaterialOrder): Promise<MaterialOrder> {
    const { error: orderError } = await this.db.from("material_orders").insert({
      id: order.id,
      number: order.number,
      council_id: order.councilId,
      status: order.status,
      requested_by: order.requestedBy,
      notes: order.notes ?? null,
      reviewed_by: order.reviewedBy ?? null,
      reviewed_at: order.reviewedAt ? toIso(order.reviewedAt) : null,
      rejection_reason: order.rejectionReason ?? null,
      created_at: toIso(order.createdAt),
      updated_at: toIso(order.updatedAt),
    });
    unwrap("material_orders.insert", { data: null, error: orderError });

    if (order.items.length > 0) {
      const { error: itemsError } = await this.db.from("material_order_items").insert(
        order.items.map((i) => ({
          id: i.id,
          order_id: order.id,
          material_id: i.materialId,
          quantity: i.quantity,
        })),
      );
      unwrap("material_order_items.insert", { data: null, error: itemsError });
    }

    return order;
  }

  async update(order: MaterialOrder): Promise<MaterialOrder> {
    const { error } = await this.db
      .from("material_orders")
      .update({
        status: order.status,
        notes: order.notes ?? null,
        reviewed_by: order.reviewedBy ?? null,
        reviewed_at: order.reviewedAt ? toIso(order.reviewedAt) : null,
        rejection_reason: order.rejectionReason ?? null,
        updated_at: toIso(order.updatedAt),
      })
      .eq("id", order.id);
    unwrap("material_orders.update", { data: null, error });

    return order;
  }

  async getById(id: string): Promise<MaterialOrder | null> {
    const row = unwrap(
      "material_orders.getById",
      await this.db
        .from("material_orders")
        .select(SELECT)
        .eq("id", id)
        .maybeSingle<OrderRow>(),
    );
    return row ? toOrder(row) : null;
  }

  async findById(id: string): Promise<MaterialOrder | null> {
    return this.getById(id);
  }

  async list(
    councilIds: readonly string[] | "all",
    filter?: MaterialOrderFilter,
  ): Promise<MaterialOrder[]> {
    return selectAll<OrderRow>("material_orders.list", (from, to) => {
      let query = this.db.from("material_orders").select(SELECT);
      if (councilIds !== "all") {
        query = query.in("council_id", councilIds);
      }
      if (filter?.councilId) {
        query = query.eq("council_id", filter.councilId);
      }
      if (filter?.status) {
        query = query.eq("status", filter.status);
      }
      return query.order("created_at", { ascending: false }).range(from, to);
    }).then((rows) => rows.map(toOrder));
  }

  async nextNumber(councilId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PED-${year}-`;
    const { data, error } = await this.db
      .from("material_orders")
      .select("number")
      .eq("council_id", councilId)
      .like("number", `${prefix}%`)
      .order("number", { ascending: false })
      .limit(1);
    unwrap("material_orders.nextNumber", { data: null, error });

    let nextSeq = 1;
    if (data && data.length > 0 && data[0]?.number) {
      const lastNum = data[0].number;
      const seqPart = parseInt(lastNum.slice(prefix.length), 10);
      if (!isNaN(seqPart)) {
        nextSeq = seqPart + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(3, "0")}`;
  }
}
