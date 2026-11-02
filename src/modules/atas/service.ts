import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { toFortalezaDate } from "@/shared/lib/time";
import { computeAtaBalance, validateAllocations, validateCommitment, type AtaBalance, type CouncilAllocation } from "./domain/balance";
import { ataValidityStatus, computeInitialEndDate, currentEndDate, requestExtension, type AtaValidityStatus } from "./domain/validity";
import type { AtaRepository } from "./repository";
import { ataIdSchema, createAtaSchema, setAllocationsSchema, type PriceRegistrationAta } from "./schemas";

export interface AtaItemView {
  itemId: string;
  description: string;
  materialId: string | null;
  allocations: CouncilAllocation[];
  balance: AtaBalance;
}

export interface AtaView {
  ata: PriceRegistrationAta;
  endDate: string;
  validity: AtaValidityStatus;
  items: AtaItemView[];
}

export class AtaService {
  constructor(
    private readonly repository: AtaRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async create(actor: Actor, input: unknown): Promise<Result<PriceRegistrationAta>> {
    const parsed = parseInput(createAtaSchema, input);
    if (!parsed.ok) return parsed;
    const d = parsed.data;
    const allowed = await guard(this.audit, actor, "ata.manage", d.councilId, "price_registration_ata");
    if (!allowed.ok) return allowed;

    // Nasce como rascunho: rascunho não consome saldo e não aceita comprometimento (R9).
    const saved = await this.repository.insert({
      id: this.runtime.newId(),
      councilId: d.councilId,
      number: d.number,
      supplierId: d.supplierId ?? null,
      startDate: d.startDate,
      status: "rascunho",
      items: d.items.map((i) => ({ id: this.runtime.newId(), description: i.description, materialId: i.materialId ?? null, registeredQuantity: i.registeredQuantity, unitPrice: i.unitPrice, allocations: [] })),
      extensions: [],
      createdAt: this.runtime.now(),
    });
    await this.audit.record({ actorId: actor.userId, action: "ata.create", entity: "price_registration_ata", entityId: saved.id, councilId: d.councilId, result: "success", details: { number: d.number } });
    return ok(saved);
  }

  async activate(actor: Actor, input: unknown): Promise<Result<PriceRegistrationAta>> {
    const loaded = await this.loadManaged(actor, input);
    if (!loaded.ok) return loaded;
    if (loaded.data.status !== "rascunho") return fail("INVALID_STATE", "A ata já está vigente.");
    const saved = await this.repository.save({ ...loaded.data, status: "vigente" });
    await this.audit.record({ actorId: actor.userId, action: "ata.activate", entity: "price_registration_ata", entityId: saved.id, councilId: saved.councilId, result: "success", details: {} });
    return ok(saved);
  }

  /** Prorrogação somente por solicitação explícita de gestor (nunca automática, R10). */
  async extend(actor: Actor, input: unknown): Promise<Result<PriceRegistrationAta>> {
    const loaded = await this.loadManaged(actor, input);
    if (!loaded.ok) return loaded;
    const ata = loaded.data;
    if (ata.status !== "vigente") return fail("INVALID_STATE", "Somente atas vigentes podem ser prorrogadas.");

    const extension = requestExtension({ startDate: ata.startDate, extensions: ata.extensions, requestedBy: actor.userId, today: toFortalezaDate(this.runtime.now()) });
    if (!extension.ok) return extension;
    const saved = await this.repository.save({ ...ata, extensions: [...ata.extensions, extension.data] });
    await this.audit.record({ actorId: actor.userId, action: "ata.extend", entity: "price_registration_ata", entityId: ata.id, councilId: ata.councilId, result: "success", details: { ...extension.data } });
    return ok(saved);
  }

  /** Alocação opcional por conselho (P5). */
  async setAllocations(actor: Actor, input: unknown): Promise<Result<PriceRegistrationAta>> {
    const parsed = parseInput(setAllocationsSchema, input);
    if (!parsed.ok) return parsed;
    const ata = await this.repository.findById(parsed.data.ataId);
    if (!ata) return fail("NOT_FOUND", "Ata não encontrada.");
    const allowed = await guard(this.audit, actor, "ata.manage", ata.councilId, "price_registration_ata", ata.id);
    if (!allowed.ok) return allowed;

    const item = ata.items.find((i) => i.id === parsed.data.itemId);
    if (!item) return fail("NOT_FOUND", "Item da ata não encontrado.");
    const valid = validateAllocations(item.registeredQuantity, parsed.data.allocations);
    if (!valid.ok) return valid;
    item.allocations = parsed.data.allocations;
    const saved = await this.repository.save(ata);
    await this.audit.record({ actorId: actor.userId, action: "ata.allocate", entity: "price_registration_ata", entityId: ata.id, councilId: ata.councilId, result: "success", details: { itemId: item.id, allocations: parsed.data.allocations } });
    return ok(saved);
  }

  /**
   * Compromete saldo de um item (chamado por solicitações aprovadas, já autorizadas).
   * Atômico: valida contra o ledger sob lock e grava o evento (R9).
   */
  /** Verifica se o item aceita novos comprometimentos (ata vigente e não vencida). O saldo é conferido sob lock na gravação. */
  async checkCommittable(itemId: string): Promise<Result<true>> {
    const ata = await this.repository.findByItemId(itemId);
    if (!ata) return fail("NOT_FOUND", "Item de ata não encontrado.");
    if (ata.status !== "vigente") return fail("INVALID_STATE", "A ata não está vigente; rascunho não consome saldo.");
    if (ataValidityStatus(currentEndDate(ata.startDate, ata.extensions), toFortalezaDate(this.runtime.now())) === "vencida") {
      return fail("INVALID_STATE", "A ata está vencida e não aceita novos comprometimentos.");
    }
    return ok(true);
  }

  async commitInternal(params: { itemId: string; councilId: string; quantity: number; reference: string }): Promise<Result<AtaBalance>> {
    const committable = await this.checkCommittable(params.itemId);
    if (!committable.ok) return committable;
    const ata = (await this.repository.findByItemId(params.itemId))!;
    const item = ata.items.find((i) => i.id === params.itemId)!;

    const result = await this.repository.appendEventAtomically(params.itemId, (events) => {
      const check = validateCommitment({ registered: item.registeredQuantity, events, allocations: item.allocations, councilId: params.councilId, quantity: params.quantity });
      return check.ok ? ok({ type: "commit", quantity: params.quantity, councilId: params.councilId, legalBasis: params.reference }) : check;
    });
    if (!result.ok) return result;
    return ok(computeAtaBalance(item.registeredQuantity, await this.repository.listEvents(params.itemId)));
  }

  /** Devolve saldo (cancelamento de solicitação aprovada), com base/justificativa registrada. */
  async releaseInternal(params: { itemId: string; councilId: string; quantity: number; reason: string }): Promise<Result<AtaBalance>> {
    const ata = await this.repository.findByItemId(params.itemId);
    if (!ata) return fail("NOT_FOUND", "Item de ata não encontrado.");
    const item = ata.items.find((i) => i.id === params.itemId)!;
    const result = await this.repository.appendEventAtomically(params.itemId, (events) => {
      const committed = events.filter((e) => e.councilId === params.councilId).reduce((s, e) => (e.type === "commit" ? s + e.quantity : s - e.quantity), 0);
      if (params.quantity > committed) return fail("INVALID_STATE", "Liberação maior que o comprometido.");
      return ok({ type: "release", quantity: params.quantity, councilId: params.councilId, legalBasis: params.reason });
    });
    if (!result.ok) return result;
    return ok(computeAtaBalance(item.registeredQuantity, await this.repository.listEvents(params.itemId)));
  }

  async get(actor: Actor, ataId: string): Promise<Result<AtaView>> {
    const ata = await this.repository.findById(ataId);
    if (!ata || !can(actor, "council.read", ata.councilId)) return fail("NOT_FOUND", "Ata não encontrada.");
    return ok(await this.toView(ata));
  }

  async list(actor: Actor): Promise<Result<AtaView[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    const atas = await this.repository.listByCouncils(scope);
    return ok(await Promise.all(atas.map((a) => this.toView(a))));
  }

  private async toView(ata: PriceRegistrationAta): Promise<AtaView> {
    const endDate = currentEndDate(ata.startDate, ata.extensions);
    const items = await Promise.all(ata.items.map(async (i) => ({
      itemId: i.id,
      description: i.description,
      materialId: i.materialId,
      allocations: i.allocations,
      balance: computeAtaBalance(i.registeredQuantity, await this.repository.listEvents(i.id)),
    })));
    return { ata, endDate, validity: ataValidityStatus(endDate, toFortalezaDate(this.runtime.now())), items };
  }

  private async loadManaged(actor: Actor, input: unknown): Promise<Result<PriceRegistrationAta>> {
    const parsed = parseInput(ataIdSchema, input);
    if (!parsed.ok) return parsed;
    const ata = await this.repository.findById(parsed.data.ataId);
    if (!ata) return fail("NOT_FOUND", "Ata não encontrada.");
    const allowed = await guard(this.audit, actor, "ata.manage", ata.councilId, "price_registration_ata", ata.id);
    return allowed.ok ? ok(ata) : allowed;
  }
}

/** Data final inicial prevista para exibição em formulários. */
export const previewAtaEndDate = computeInitialEndDate;
