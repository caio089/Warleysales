import { fail, ok, type Result } from "@/shared/lib/result";
import type { SupplierRepository } from "./repository";
import type { Supplier } from "./schemas";

export class InMemorySupplierRepository implements SupplierRepository {
  private rows = new Map<string, Supplier>();
  private duplicate(s: Supplier) { return s.cnpj !== null && [...this.rows.values()].some((o) => o.id !== s.id && o.cnpj === s.cnpj); }
  async insert(s: Supplier): Promise<Result<Supplier>> {
    if (this.duplicate(s)) return fail("CONFLICT", "Já existe fornecedor com este CNPJ.");
    this.rows.set(s.id, s);
    return ok(s);
  }
  async update(s: Supplier): Promise<Result<Supplier>> {
    if (this.duplicate(s)) return fail("CONFLICT", "Já existe fornecedor com este CNPJ.");
    this.rows.set(s.id, s);
    return ok(s);
  }
  async findById(id: string) { return this.rows.get(id) ?? null; }
  async list() { return [...this.rows.values()]; }
}
