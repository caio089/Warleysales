import type { AuditRecorder } from "@/modules/audit/service";
import { canInAnyCouncil, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import type { SupplierRepository } from "./repository";
import { createSupplierSchema, updateSupplierSchema, type Supplier } from "./schemas";

/** Fornecedores são um catálogo global (CNPJ único, P8); escrita exige papel de gestor em algum conselho. */
export class SupplierService {
  constructor(
    private readonly repository: SupplierRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  private async canManage(actor: Actor, entityId: string | null): Promise<boolean> {
    if (canInAnyCouncil(actor, "supplier.manage")) return true;
    await this.audit.record({ actorId: actor.userId, action: "supplier.manage", entity: "supplier", entityId, councilId: null, result: "denied", details: {} });
    return false;
  }

  async create(actor: Actor, input: unknown): Promise<Result<Supplier>> {
    const parsed = parseInput(createSupplierSchema, input);
    if (!parsed.ok) return parsed;
    if (!(await this.canManage(actor, null))) return fail("FORBIDDEN", "Você não tem permissão para executar esta ação.");
    const saved = await this.repository.insert({ id: this.runtime.newId(), ...parsed.data, active: true });
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "supplier.create", entity: "supplier", entityId: saved.data.id, councilId: null, result: "success", details: {} });
    return saved;
  }

  async update(actor: Actor, input: unknown): Promise<Result<Supplier>> {
    const parsed = parseInput(updateSupplierSchema, input);
    if (!parsed.ok) return parsed;
    if (!(await this.canManage(actor, parsed.data.supplierId))) return fail("FORBIDDEN", "Você não tem permissão para executar esta ação.");
    const current = await this.repository.findById(parsed.data.supplierId);
    if (!current) return fail("NOT_FOUND", "Fornecedor não encontrado.");
    const { supplierId, active, ...fields } = parsed.data;
    const saved = await this.repository.update({ ...current, ...fields, id: supplierId, active: active ?? current.active });
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "supplier.update", entity: "supplier", entityId: supplierId, councilId: null, result: "success", details: {} });
    return saved;
  }

  /** Reusa o fornecedor pelo nome ou cadastra um novo, para a contratação do pregão. */
  async ensureByName(actor: Actor, name: string): Promise<Result<Supplier>> {
    const trimmed = name.trim();
    if (trimmed.length < 2) return fail("VALIDATION", "Informe o fornecedor.");
    if (!actor.isCentralAdmin && actor.memberships.length === 0) return fail("FORBIDDEN", "Sem acesso.");

    const existing = (await this.repository.list()).find(
      (supplier) => supplier.name.trim().toLocaleLowerCase("pt-BR") === trimmed.toLocaleLowerCase("pt-BR"),
    );
    if (existing) return ok(existing);

    const saved = await this.repository.insert({
      id: this.runtime.newId(),
      name: trimmed,
      cnpj: null,
      email: null,
      phone: null,
      active: true,
    });
    if (saved.ok) {
      await this.audit.record({
        actorId: actor.userId,
        action: "supplier.create",
        entity: "supplier",
        entityId: saved.data.id,
        councilId: null,
        result: "success",
        details: { source: "formalization" },
      });
    }
    return saved;
  }

  async list(actor: Actor): Promise<Result<Supplier[]>> {
    if (!actor.isCentralAdmin && actor.memberships.length === 0) return fail("FORBIDDEN", "Sem acesso.");
    return ok(await this.repository.list());
  }
}
