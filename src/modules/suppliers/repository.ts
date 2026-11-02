import type { Result } from "@/shared/lib/result";
import type { Supplier } from "./schemas";

export interface SupplierRepository {
  /** CONFLICT quando o CNPJ já existe (restrição UNIQUE no banco). */
  insert(supplier: Supplier): Promise<Result<Supplier>>;
  update(supplier: Supplier): Promise<Result<Supplier>>;
  findById(id: string): Promise<Supplier | null>;
  list(): Promise<Supplier[]>;
}
