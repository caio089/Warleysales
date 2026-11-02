import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { changeMeetingStatus } from "./domain/meeting-status";
import type { MeetingRepository } from "./repository";
import { actionItemSchema, changeMeetingStatusSchema, minutesSchema, scheduleMeetingSchema, type Meeting } from "./schemas";

export class MeetingService {
  constructor(
    private readonly repository: MeetingRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async schedule(actor: Actor, input: unknown): Promise<Result<Meeting>> {
    const parsed = parseInput(scheduleMeetingSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "meeting.manage", parsed.data.councilId, "meeting");
    if (!allowed.ok) return allowed;
    const saved = await this.repository.insert({ id: this.runtime.newId(), ...parsed.data, status: "agendada", minutes: null, actionItems: [], createdBy: actor.userId });
    await this.audit.record({ actorId: actor.userId, action: "meeting.schedule", entity: "meeting", entityId: saved.id, councilId: saved.councilId, result: "success", details: {} });
    return ok(saved);
  }

  /** Reagendar passa por "reagendada" e volta a "agendada" na nova data (§7). */
  async changeStatus(actor: Actor, input: unknown): Promise<Result<Meeting>> {
    const parsed = parseInput(changeMeetingStatusSchema, input);
    if (!parsed.ok) return parsed;
    const meeting = await this.repository.findById(parsed.data.meetingId);
    if (!meeting) return fail("NOT_FOUND", "Reunião não encontrada.");
    const allowed = await guard(this.audit, actor, "meeting.manage", meeting.councilId, "meeting", meeting.id);
    if (!allowed.ok) return allowed;

    const valid = changeMeetingStatus(meeting.status, parsed.data.to);
    if (!valid.ok) return valid;

    let next: Meeting = { ...meeting, status: parsed.data.to };
    if (parsed.data.to === "reagendada") {
      if (!parsed.data.newScheduledAt) return fail("VALIDATION", "Informe a nova data da reunião.", { newScheduledAt: ["Obrigatória ao reagendar."] });
      next = { ...next, scheduledAt: parsed.data.newScheduledAt, status: "agendada" };
    }
    const saved = await this.repository.save(next);
    await this.audit.record({ actorId: actor.userId, action: `meeting.${parsed.data.to}`, entity: "meeting", entityId: meeting.id, councilId: meeting.councilId, result: "success", details: { from: meeting.status } });
    return ok(saved);
  }

  /** A ata de reunião só pode ser registrada depois que a reunião foi realizada. */
  async saveMinutes(actor: Actor, input: unknown): Promise<Result<Meeting>> {
    const parsed = parseInput(minutesSchema, input);
    if (!parsed.ok) return parsed;
    const meeting = await this.repository.findById(parsed.data.meetingId);
    if (!meeting) return fail("NOT_FOUND", "Reunião não encontrada.");
    const allowed = await guard(this.audit, actor, "meeting.manage", meeting.councilId, "meeting", meeting.id);
    if (!allowed.ok) return allowed;
    if (meeting.status !== "realizada") return fail("INVALID_STATE", "A ata só pode ser registrada após a reunião ser realizada.");
    const saved = await this.repository.save({ ...meeting, minutes: { text: parsed.data.text, registeredBy: actor.userId, registeredAt: this.runtime.now() } });
    await this.audit.record({ actorId: actor.userId, action: "meeting.minutes", entity: "meeting", entityId: meeting.id, councilId: meeting.councilId, result: "success", details: {} });
    return ok(saved);
  }

  async addActionItem(actor: Actor, input: unknown): Promise<Result<Meeting>> {
    const parsed = parseInput(actionItemSchema, input);
    if (!parsed.ok) return parsed;
    const meeting = await this.repository.findById(parsed.data.meetingId);
    if (!meeting) return fail("NOT_FOUND", "Reunião não encontrada.");
    const allowed = await guard(this.audit, actor, "meeting.manage", meeting.councilId, "meeting", meeting.id);
    if (!allowed.ok) return allowed;
    const item = { id: this.runtime.newId(), description: parsed.data.description, responsibleId: parsed.data.responsibleId ?? null, dueDate: parsed.data.dueDate ?? null, done: false };
    const saved = await this.repository.save({ ...meeting, actionItems: [...meeting.actionItems, item] });
    await this.audit.record({ actorId: actor.userId, action: "meeting.action_item", entity: "meeting", entityId: meeting.id, councilId: meeting.councilId, result: "success", details: { description: item.description } });
    return ok(saved);
  }

  async list(actor: Actor): Promise<Result<Meeting[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok(await this.repository.listByCouncils(scope));
  }

  async get(actor: Actor, id: string): Promise<Result<Meeting>> {
    const meeting = await this.repository.findById(id);
    if (!meeting || !can(actor, "council.read", meeting.councilId)) return fail("NOT_FOUND", "Reunião não encontrada.");
    return ok(meeting);
  }
}
