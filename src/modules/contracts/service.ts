import type { AuditRecorder } from "@/modules/audit/service";
import type { AtaService } from "@/modules/atas/service";
import type { ProcessRepository } from "@/modules/processes/repository";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { diffInDays, toFortalezaDate } from "@/shared/lib/time";
import { addAmendment, currentTerms, elapsedPercent, remainingDays, type ContractTerms } from "./domain/terms";
import type { ContractRepository } from "./repository";
import { addAmendmentSchema, createContractSchema, linkContractProcessSchema, type Contract, type ContractAtaItem } from "./schemas";

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
    private readonly processes?: ProcessRepository,
    private readonly atas?: AtaService,
  ) {}

  private async sameCouncilProcess(councilId: string, processId: string | null | undefined): Promise<Result<string | null>> {
    if (!processId) return ok(null);
    if (!this.processes) return fail("UNAVAILABLE", "Não foi possível conferir o processo.");
    const process = await this.processes.findById(processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");
    if (process.councilId !== councilId) return fail("VALIDATION", "O processo precisa ser do mesmo órgão do contrato.");
    return ok(process.id);
  }

  async create(actor: Actor, input: unknown): Promise<Result<Contract>> {
    const parsed = parseInput(createContractSchema, input);
    if (!parsed.ok) return parsed;
    const d = parsed.data;
    const allowed = await guard(this.audit, actor, "contract.manage", d.councilId, "contract");
    if (!allowed.ok) return allowed;
    if (diffInDays(d.startDate, d.endDate) < 0) {
      return fail("VALIDATION", "A data final não pode ser anterior ao início.", { endDate: ["Data final anterior ao início."] });
    }
    const processId = await this.sameCouncilProcess(d.councilId, d.processId);
    if (!processId.ok) return processId;

    const ataId = d.ataId ?? null;
    const ataLines = (d.ataItems ?? []).filter((item) => item.quantity > 0);
    if (ataId && ataLines.length === 0) {
      return fail("VALIDATION", "Informe a quantidade de pelo menos um item da ata.", {
        ataItems: ["Informe a quantidade do contrato."],
      });
    }
    if (ataLines.length > 0 && !ataId) {
      return fail("VALIDATION", "Informe a ata para descontar as quantidades do contrato.", {
        ataId: ["Selecione a ata."],
      });
    }
    if (ataId) {
      if (!this.atas) return fail("UNAVAILABLE", "Não foi possível conferir a ata.");
      const ata = await this.atas.get(actor, ataId);
      if (!ata.ok) return ata;
      if (ata.data.ata.councilId !== d.councilId) {
        return fail("VALIDATION", "A ata precisa ser do mesmo órgão do contrato.");
      }
      if (ata.data.ata.status !== "vigente") {
        return fail("INVALID_STATE", "Ative a ata antes de consumir saldo com o contrato.");
      }
      for (const line of ataLines) {
        const item = ata.data.items.find((row) => row.itemId === line.ataItemId);
        if (!item) return fail("NOT_FOUND", "Item da ata não encontrado.");
        if (line.quantity > item.balance.balance) {
          return fail(
            "VALIDATION",
            `Quantidade acima do saldo da ata (disponível: ${item.balance.balance}).`,
            { ataItems: [`Saldo insuficiente em ${item.description}.`] },
          );
        }
      }
    }

    const contractId = this.runtime.newId();
    const ataItems: ContractAtaItem[] = ataLines.map((line) => ({
      id: this.runtime.newId(),
      ataItemId: line.ataItemId,
      quantity: line.quantity,
      unitPrice: line.unitPrice ?? 0,
    }));

    const committed: { itemId: string; quantity: number }[] = [];
    if (ataId && ataItems.length > 0 && this.atas) {
      for (const line of ataItems) {
        const result = await this.atas.commitInternal({
          itemId: line.ataItemId,
          councilId: d.councilId,
          quantity: line.quantity,
          reference: `contract:${contractId}`,
        });
        if (!result.ok) {
          for (const done of committed) {
            await this.atas.releaseInternal({
              itemId: done.itemId,
              councilId: d.councilId,
              quantity: done.quantity,
              reason: `rollback contrato ${contractId}`,
            });
          }
          return result;
        }
        committed.push({ itemId: line.ataItemId, quantity: line.quantity });
      }
    }

    const saved = await this.repository.insert({
      id: contractId,
      councilId: d.councilId,
      number: d.number,
      supplierId: d.supplierId ?? null,
      processId: processId.data,
      ataId,
      object: d.object,
      original: { startDate: d.startDate, endDate: d.endDate, value: d.value },
      amendments: [],
      ataItems,
      createdAt: this.runtime.now(),
    });
    await this.audit.record({
      actorId: actor.userId,
      action: "contract.create",
      entity: "contract",
      entityId: saved.id,
      councilId: d.councilId,
      result: "success",
      details: { number: d.number, ataId, ataItemCount: ataItems.length },
    });
    return ok(saved);
  }

  /** Vincula ou remove o processo. Atas com o mesmo processo passam a aparecer neste contrato. */
  async linkProcess(actor: Actor, input: unknown): Promise<Result<Contract>> {
    const parsed = parseInput(linkContractProcessSchema, input);
    if (!parsed.ok) return parsed;
    const contract = await this.repository.findById(parsed.data.contractId);
    if (!contract) return fail("NOT_FOUND", "Contrato não encontrado.");
    const allowed = await guard(this.audit, actor, "contract.manage", contract.councilId, "contract", contract.id);
    if (!allowed.ok) return allowed;
    const processId = await this.sameCouncilProcess(contract.councilId, parsed.data.processId);
    if (!processId.ok) return processId;
    const saved = await this.repository.save({ ...contract, processId: processId.data });
    await this.audit.record({
      actorId: actor.userId,
      action: "contract.update",
      entity: "contract",
      entityId: contract.id,
      councilId: contract.councilId,
      result: "success",
      details: { processId: processId.data },
    });
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
    await this.audit.record({
      actorId: actor.userId,
      action: "contract.amend",
      entity: "contract",
      entityId: contract.id,
      councilId: contract.councilId,
      result: "success",
      details: { sequence: amendments.data.length, reason: parsed.data.reason },
    });
    return ok(saved);
  }

  async get(actor: Actor, contractId: string): Promise<Result<ContractView>> {
    const contract = await this.repository.findById(contractId);
    if (!contract || !can(actor, "council.read", contract.councilId)) return fail("NOT_FOUND", "Contrato não encontrado.");
    return ok(this.toView(contract));
  }

  async list(actor: Actor, process?: { id: string; councilId: string }): Promise<Result<ContractView[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok((await this.repository.listByCouncils(scope, process)).map((c) => this.toView(c)));
  }

  private toView(contract: Contract): ContractView {
    const terms = currentTerms(contract.original, contract.amendments);
    const today = toFortalezaDate(this.runtime.now());
    const days = remainingDays(terms, today);
    return {
      contract: { ...contract, ataItems: contract.ataItems ?? [] },
      terms,
      remainingDays: days,
      elapsedPercent: elapsedPercent(terms, today),
      status: days >= 0 ? "vigente" : "vencido",
    };
  }
}
