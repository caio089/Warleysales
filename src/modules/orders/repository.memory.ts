import type { MaterialOrder } from "./schemas";
import type { MaterialOrderFilter, MaterialOrderRepository } from "./repository";

export class InMemoryMaterialOrderRepository implements MaterialOrderRepository {
  private orders = new Map<string, MaterialOrder>();

  constructor(private readonly clock: () => Date = () => new Date()) {}

  async create(order: MaterialOrder): Promise<MaterialOrder> {
    const clone: MaterialOrder = {
      ...order,
      items: order.items.map((i) => ({ ...i })),
      createdAt: order.createdAt ?? this.clock(),
      updatedAt: order.updatedAt ?? this.clock(),
    };
    this.orders.set(order.id, clone);
    return {
      ...clone,
      items: clone.items.map((i) => ({ ...i })),
    };
  }

  async update(order: MaterialOrder): Promise<MaterialOrder> {
    const existing = this.orders.get(order.id);
    if (!existing) {
      throw new Error(`Order ${order.id} not found`);
    }
    const updated: MaterialOrder = {
      ...order,
      items: order.items ? order.items.map((i) => ({ ...i })) : existing.items.map((i) => ({ ...i })),
      updatedAt: order.updatedAt ?? this.clock(),
    };
    this.orders.set(order.id, updated);
    return {
      ...updated,
      items: updated.items.map((i) => ({ ...i })),
    };
  }

  async getById(id: string): Promise<MaterialOrder | null> {
    const order = this.orders.get(id);
    if (!order) return null;
    return {
      ...order,
      items: order.items.map((i) => ({ ...i })),
    };
  }

  async findById(id: string): Promise<MaterialOrder | null> {
    return this.getById(id);
  }

  async list(
    councilIds: readonly string[] | "all",
    filter?: MaterialOrderFilter,
  ): Promise<MaterialOrder[]> {
    const all = Array.from(this.orders.values());
    const filtered = all.filter((order) => {
      if (councilIds !== "all" && !councilIds.includes(order.councilId)) {
        return false;
      }
      if (filter?.councilId && order.councilId !== filter.councilId) {
        return false;
      }
      if (filter?.status && order.status !== filter.status) {
        return false;
      }
      return true;
    });

    return filtered
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((order) => ({
        ...order,
        items: order.items.map((i) => ({ ...i })),
      }));
  }

  async nextNumber(councilId: string): Promise<string> {
    const year = this.clock().getFullYear();
    const prefix = `PED-${year}-`;
    let maxSeq = 0;

    for (const order of this.orders.values()) {
      if (order.councilId === councilId && order.number?.startsWith(prefix)) {
        const seqPart = parseInt(order.number.slice(prefix.length), 10);
        if (!isNaN(seqPart) && seqPart > maxSeq) {
          maxSeq = seqPart;
        }
      }
    }

    return `${prefix}${String(maxSeq + 1).padStart(3, "0")}`;
  }
}
