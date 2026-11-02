import { z } from "zod";
import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { idSchema, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { parseWhatsapp } from "./domain/whatsapp";
import type { CouncilRepository, MembershipRepository } from "./repository";
import type { Council, MembershipRecord, ProfileSummary } from "./schemas";
import type { CouncilRole } from "@/shared/lib/authz/navigation";

const councilFields = {
  name: z.string().trim().min(3, "Informe o nome do conselho.").max(200),
  acronym: z.string().trim().min(2).max(20),
  institutionalInfo: z.string().trim().max(2000).nullish().transform((v) => v ?? null),
  whatsappE164: z
    .string()
    .trim()
    .nullish()
    .transform((raw, ctx) => {
      const parsed = parseWhatsapp(raw ?? null);
      if (!parsed.ok) {
        ctx.addIssue({ code: "custom", message: parsed.message });
        return z.NEVER;
      }
      return parsed.value;
    }),
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

const assignMembershipSchema = z.object({
  userId: idSchema,
  councilId: idSchema,
  role: z.enum(["council_manager", "council_operator", "viewer"]),
});
const removeMembershipSchema = z.object({ userId: idSchema, councilId: idSchema });

export interface MembershipDirectory {
  memberships: Array<MembershipRecord & { userName: string; councilLabel: string }>;
  profiles: ProfileSummary[];
  councils: Council[];
  roles: { value: CouncilRole; label: string }[];
}

const ROLE_LABEL: Record<CouncilRole, string> = {
  council_manager: "Gestor",
  council_operator: "Operador",
  viewer: "Consulta",
};

/** Vínculos usuário ↔ conselho. Somente admin central (P7 / user.manage). Convite continua no Auth. */
export class MembershipService {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly councils: CouncilRepository,
    private readonly audit: AuditRecorder,
  ) {}

  async directory(actor: Actor): Promise<Result<MembershipDirectory>> {
    const allowed = await guard(this.audit, actor, "user.manage", undefined, "council_membership");
    if (!allowed.ok) return allowed;
    const [records, profiles, councils] = await Promise.all([
      this.memberships.listAll(),
      this.memberships.listProfiles(),
      this.councils.list("all"),
    ]);
    const nameById = Object.fromEntries(profiles.map((p) => [p.id, p.fullName || p.id.slice(0, 8)]));
    const councilById = Object.fromEntries(councils.map((c) => [c.id, c.acronym]));
    return ok({
      memberships: records.map((r) => ({
        ...r,
        userName: nameById[r.userId] ?? r.userId.slice(0, 8),
        councilLabel: councilById[r.councilId] ?? "—",
      })),
      profiles,
      councils,
      roles: (Object.keys(ROLE_LABEL) as CouncilRole[]).map((value) => ({ value, label: ROLE_LABEL[value] })),
    });
  }

  async assign(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(assignMembershipSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "user.manage", parsed.data.councilId, "council_membership", parsed.data.userId);
    if (!allowed.ok) return allowed;
    const council = await this.councils.findById(parsed.data.councilId);
    if (!council) return fail("NOT_FOUND", "Conselho não encontrado.");
    const profiles = await this.memberships.listProfiles();
    if (!profiles.some((p) => p.id === parsed.data.userId)) return fail("NOT_FOUND", "Usuário não encontrado. Convide-o primeiro no Auth.");
    await this.memberships.upsert(parsed.data);
    await this.audit.record({ actorId: actor.userId, action: "membership.assign", entity: "council_membership", entityId: parsed.data.userId, councilId: parsed.data.councilId, result: "success", details: { role: parsed.data.role } });
    return ok(true);
  }

  async remove(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(removeMembershipSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "user.manage", parsed.data.councilId, "council_membership", parsed.data.userId);
    if (!allowed.ok) return allowed;
    const removed = await this.memberships.remove(parsed.data.userId, parsed.data.councilId);
    if (!removed) return fail("NOT_FOUND", "Vínculo não encontrado.");
    await this.audit.record({ actorId: actor.userId, action: "membership.remove", entity: "council_membership", entityId: parsed.data.userId, councilId: parsed.data.councilId, result: "success", details: {} });
    return ok(true);
  }
}
