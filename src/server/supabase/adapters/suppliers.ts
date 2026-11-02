import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupplierRepository } from "@/modules/suppliers/repository";
import type { Supplier } from "@/modules/suppliers/schemas";
import { fail, ok } from "@/shared/lib/result";
import { isUniqueViolation, selectAll, unwrap } from "../db";

export class SupabaseSupplierRepository implements SupplierRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(supplier: Supplier) {
    const { error } = await this.db.from("suppliers").insert(supplier);
    if (isUniqueViolation(error)) return fail("CONFLICT", "Já existe fornecedor com este CNPJ.");
    unwrap("suppliers.insert", { data: null, error });
    return ok(supplier);
  }

  async update(supplier: Supplier) {
    const { data, error } = await this.db.from("suppliers").update(supplier).eq("id", supplier.id).select().maybeSingle<Supplier>();
    if (isUniqueViolation(error)) return fail("CONFLICT", "Já existe fornecedor com este CNPJ.");
    const row = unwrap("suppliers.update", { data, error });
    return row ? ok(supplier) : fail("NOT_FOUND", "Fornecedor não encontrado.");
  }

  async findById(id: string) {
    return unwrap("suppliers.find", await this.db.from("suppliers").select("id, name, cnpj, email, phone, active").eq("id", id).maybeSingle<Supplier>());
  }

  async list() {
    return selectAll<Supplier>("suppliers.list", (from, to) => this.db.from("suppliers").select("id, name, cnpj, email, phone, active").order("name").range(from, to));
  }
}
