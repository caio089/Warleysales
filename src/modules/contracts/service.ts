import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { diffInDays, toFortalezaDate } from "@/shared/lib/time";
import { addAmendment, currentTerms, elapsedPercent, remainingDays, type ContractTerms } from "./domain/terms";
import type { ContractRepository } from "./repository";
import { addAmendmentSchema, createContractSchema, type Contract } from "./schemas";

export interface ContractView {
  contract: Contract;
  terms: ContractTerms;
  remainingDays: number;
  elapsedPercent: number;
  status: "vigente" | "vencido";
}

export class ContractService {
  constructor(
    private readonly repository: ContractRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async create(actor: Actor, input: unknown): Promise<Result<Contract>> {
    const parsed = parseInput(createContractSchema, input);
    if (!parsed.ok) return parsed;
    const d = parsed.data;
    const allowed = await guard(this.audit, actor, "contract.manage", d.councilId, "contract");
    if (!allowed.ok) return allowed;
    if (diffInDays(d.startDate, d.endDate) < 0) return fail("VALIDATION", "A data final não pode ser anterior ao início.", { endDate: ["Data final anterior ao início."] });

    const saved = await this.repository.insert({
      id: this.runtime.newId(), councilId: d.councilId, number: d.number, supplierId: d.supplierId ?? null, object: d.object,
      original: { startDate: d.startDate, endDate: d.endDate, value: d.value }, amendments: [], createdAt: this.runtime.now(),
    });
    await this.audit.record({ actorId: actor.userId, action: "contract.create", entity: "contract", entityId: saved.id, councilId: d.councilId, result: "success", details: { number: d.number } });
    return ok(saved);
  }

  /** Aditivo preserva prazos e valores anteriores (R16): o histórico nunca é sobrescrito. */
  async addAmendment(actor: Actor, input: unknown): Promise<Result<Contract>> {
    const parsed = parseInput(addAmendmentSchema, input);
    if (!parsed.ok) return parsed;
    const contract = await this.repository.findById(parsed.data.contractId);
    if (!contract) return fail("NOT_FOUND", "Contrato não encontrado.");
    const allowed = await guard(this.audit, actor, "contract.manage", contract.councilId, "contract", contract.id);
    if (!allowed.ok) return allowed;

    const amendments = addAmendment(contract.original, contract.amendments, parsed.data);
    if (!amendments.ok) return amendments;
    const saved = await this.repository.save({ ...contract, amendments: amendments.data });
    await this.audit.record({ actorId: actor.userId, action: "contract.amend", entity: "contract", entityId: contract.id, councilId: contract.councilId, result: "success", details: { sequence: amendments.data.length, reason: parsed.data.reason } });
    return ok(saved);
  }

  async get(actor: Actor, contractId: string): Promise<Result<ContractView>> {
    const contract = await this.repository.findById(contractId);
    if (!contract || !can(actor, "council.read", contract.councilId)) return fail("NOT_FOUND", "Contrato não encontrado.");
    return ok(this.toView(contract));
  }

  async list(actor: Actor): Promise<Result<ContractView[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok((await this.repository.listByCouncils(scope)).map((c) => this.toView(c)));
  }

  private toView(contract: Contract): ContractView {
    const terms = currentTerms(contract.original, contract.amendments);
    const today = toFortalezaDate(this.runtime.now());
    const days = remainingDays(terms, today);
    return { contract, terms, remainingDays: days, elapsedPercent: elapsedPercent(terms, today), status: days >= 0 ? "vigente" : "vencido" };
  }
}
