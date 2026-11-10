import type { MaterialOrder, MaterialOrderStatus } from "./schemas";

export interface MaterialOrderFilter {
  status?: MaterialOrderStatus;
  councilId?: string;
}

export interface MaterialOrderRepository {
  create(order: MaterialOrder): Promise<MaterialOrder>;
  update(order: MaterialOrder): Promise<MaterialOrder>;
  getById(id: string): Promise<MaterialOrder | null>;
  findById?(id: string): Promise<MaterialOrder | null>;
  list(councilIds: readonly string[] | "all", filter?: MaterialOrderFilter): Promise<MaterialOrder[]>;
  nextNumber(councilId: string): Promise<string>;
}
