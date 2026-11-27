import { z } from "zod";
import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { idSchema, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { parseWhatsapp } from "./domain/whatsapp";
import type { CouncilRepository, MembershipRepository } from "./repository";
import { STAFF_CATEGORIES, type Council, type MembershipRecord, type ProfileSummary } from "./schemas";
import { COUNCIL_ROLES, COUNCIL_ROLE_LABELS, isStaffRole, type CouncilRole } from "@/shared/lib/authz/navigation";

const councilFields = {
  organizationType: z.enum(["public_body", "private_company"]).default("public_body"),
  name: z.string().trim().min(3, "Informe o nome da organização.").max(200),
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
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "council.create", entity: "council", entityId: saved.data.id, councilId: saved.data.id, result: "success", details: { organizationType: saved.data.organizationType } });
    return saved;
  }

  async update(actor: Actor, input: unknown): Promise<Result<Council>> {
    const parsed = parseInput(updateCouncilSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "council.manage", undefined, "council", parsed.data.councilId);
    if (!allowed.ok) return allowed;
    const current = await this.repository.findById(parsed.data.councilId);
    if (!current) return fail("NOT_FOUND", "Organização não encontrada.");
    const { councilId, active, ...fields } = parsed.data;
    const saved = await this.repository.update({ ...current, ...fields, id: councilId, active: active ?? current.active });
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "council.update", entity: "council", entityId: councilId, councilId, result: "success", details: { organizationType: saved.data.organizationType } });
    return saved;
  }

  async list(actor: Actor): Promise<Result<Council[]>> {
    const scope = readableCouncilIds(actor, "request.read");
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok(await this.repository.list(scope));
  }

  async get(actor: Actor, id: string): Promise<Result<Council>> {
    const council = await this.repository.findById(id);
    if (!council || !can(actor, "council.read", id)) return fail("NOT_FOUND", "Organização não encontrada.");
    return ok(council);
  }
}

const assignMembershipSchema = z.object({
  userId: idSchema,
  councilId: idSchema,
  role: z.enum(COUNCIL_ROLES),
});
const removeMembershipSchema = z.object({ userId: idSchema, councilId: idSchema });

export interface MembershipDirectory {
  memberships: Array<MembershipRecord & { userName: string; councilLabel: string }>;
  profiles: ProfileSummary[];
  councils: Council[];
  roles: { value: CouncilRole; label: string }[];
}

/** Vínculos usuário ↔ conselho. Somente admin central (P7 / user.manage). Convite continua no Auth. */
export class MembershipService {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly councils: CouncilRepository,
    private readonly audit: AuditRecorder,
  ) {}

  async processAssignees(actor: Actor, councilId: string): Promise<ProfileSummary[]> {
    if (!can(actor, "council.read", councilId)) return [];
    const members = await this.memberships.listByCouncil(councilId);
    const ids = new Set(members.map((member) => member.userId));
    return (await this.memberships.listProfiles()).filter((profile) => profile.active && ids.has(profile.id));
  }

  /** Nomes dos participantes, inclusive membros inativos em registros históricos. */
  async meetingDirectory(actor: Actor, councilId: string): Promise<ProfileSummary[]> {
    if (!can(actor, "council.read", councilId)) return [];
    const ids = new Set((await this.memberships.listByCouncil(councilId)).map((member) => member.userId));
    return (await this.memberships.listProfiles()).filter((profile) => ids.has(profile.id));
  }

  /** Nomes de colaboradores limitados aos órgãos para os quais há permissão de relatório. */
  async meetingParticipants(actor: Actor, councilId: string): Promise<ProfileSummary[]> {
    if (!can(actor, "meeting.manage", councilId)) return [];
    const members = await this.memberships.listByCouncil(councilId);
    const ids = new Set(members.map((member) => member.userId));
    return (await this.memberships.listProfiles()).filter((profile) => ids.has(profile.id));
  }

  async reportDirectory(actor: Actor, councilId?: string): Promise<Result<ProfileSummary[]>> {
    const councils = actor.isCentralAdmin
      ? "all" as const
      : actor.memberships.filter((m) => can(actor, "report.view", m.councilId)).map((m) => m.councilId);
    if (councils !== "all" && councils.length === 0) return fail("FORBIDDEN", "Você não tem permissão para consultar colaboradores.");
    const [memberships, profiles] = await Promise.all([this.memberships.listAll(), this.memberships.listProfiles()]);
    const visible = new Set(memberships.filter((m) => (councils === "all" || councils.includes(m.councilId)) && (!councilId || m.councilId === councilId)).map((m) => m.userId));
    return ok(profiles.filter((p) => visible.has(p.id)));
  }

  async setStaffCategory(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(z.object({ userId: idSchema, category: z.enum(STAFF_CATEGORIES) }), input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "user.manage", undefined, "profile", parsed.data.userId);
    if (!allowed.ok) return allowed;
    const updated = await this.memberships.setStaffCategory(parsed.data.userId, parsed.data.category);
    if (!updated) return fail("NOT_FOUND", "Usuário não encontrado.");
    await this.audit.record({ actorId: actor.userId, action: "profile.staff_category", entity: "profile", entityId: parsed.data.userId, councilId: null, result: "success", details: { category: parsed.data.category } });
    return ok(true);
  }

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
      roles: COUNCIL_ROLES.map((value) => ({ value, label: COUNCIL_ROLE_LABELS[value] })),
    });
  }

  async assign(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(assignMembershipSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "user.manage", parsed.data.councilId, "council_membership", parsed.data.userId);
    if (!allowed.ok) return allowed;
    const council = await this.councils.findById(parsed.data.councilId);
    if (!council) return fail("NOT_FOUND", "Organização não encontrada.");
    const profiles = await this.memberships.listProfiles();
    if (!profiles.some((p) => p.id === parsed.data.userId)) return fail("NOT_FOUND", "Usuário não encontrado. Convide-o primeiro no Auth.");
    const { role, userId, councilId } = parsed.data;
    const existing = await this.memberships.listByUser(userId);
    const assignsStaffRole = isStaffRole(role);
    if (assignsStaffRole || existing.some((m) => isStaffRole(m.role))) {
      if (existing.some((m) => m.councilId !== councilId)) return fail("CONFLICT", "Este perfil deve ficar vinculado a um único órgão.");
      if (!actor.isSpecialDeleter) return fail("FORBIDDEN", "Somente Warley pode atribuir este perfil.");
      if (assignsStaffRole && council.organizationType !== "public_body") return fail("VALIDATION", "Selecione um órgão público.");
      if (role === "director" && (await this.memberships.listByCouncil(councilId)).some((m) => m.role === "director" && m.userId !== userId)) {
        return fail("CONFLICT", "Este órgão já tem um diretor.");
      }
    }
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
