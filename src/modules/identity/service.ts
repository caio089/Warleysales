import { z } from "zod";
import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { idSchema, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import type { CouncilRepository } from "./repository";
import type { Council } from "./schemas";

const councilFields = {
  name: z.string().trim().min(3, "Informe o nome do conselho.").max(200),
  acronym: z.string().trim().min(2).max(20),
  institutionalInfo: z.string().trim().max(2000).nullish().transform((v) => v ?? null),
};
const createCouncilSchema = z.object(councilFields);
const updateCouncilSchema = z.object({ councilId: idSchema, ...councilFields, active: z.boolean().optional() });

/** Conselhos: criação/edição restritas ao admin central (matriz §6). */
export class CouncilService {
  constructor(
    private readonly repository: CouncilRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async create(actor: Actor, input: unknown): Promise<Result<Council>> {
    const parsed = parseInput(createCouncilSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "council.manage", undefined, "council");
    if (!allowed.ok) return allowed;
    const saved = await this.repository.insert({ id: this.runtime.newId(), ...parsed.data, responsibleUserId: null, active: true });
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "council.create", entity: "council", entityId: saved.data.id, councilId: saved.data.id, result: "success", details: {} });
    return saved;
  }

  async update(actor: Actor, input: unknown): Promise<Result<Council>> {
    const parsed = parseInput(updateCouncilSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "council.manage", undefined, "council", parsed.data.councilId);
    if (!allowed.ok) return allowed;
    const current = await this.repository.findById(parsed.data.councilId);
    if (!current) return fail("NOT_FOUND", "Conselho não encontrado.");
    const { councilId, active, ...fields } = parsed.data;
    const saved = await this.repository.update({ ...current, ...fields, id: councilId, active: active ?? current.active });
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "council.update", entity: "council", entityId: councilId, councilId, result: "success", details: {} });
    return saved;
  }

  async list(actor: Actor): Promise<Result<Council[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok(await this.repository.list(scope));
  }

  async get(actor: Actor, id: string): Promise<Result<Council>> {
    const council = await this.repository.findById(id);
    if (!council || !can(actor, "council.read", id)) return fail("NOT_FOUND", "Conselho não encontrado.");
    return ok(council);
  }
}
