import { describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryMeetingRepository } from "./repository.memory";
import { MeetingService } from "./service";

const setup = () => { const rt = makeRuntime(); return new MeetingService(new InMemoryMeetingRepository(), new AuditService(new InMemoryAuditRepository(rt.now)), rt); };
const input = { councilId: COUNCIL_A, title: "Reunião ordinária", scheduledAt: "2026-11-10T13:00:00Z" };

describe("MeetingService", () => {
  it("agenda, realiza e registra ata de reunião", async () => {
    const s = setup();
    const m = await s.schedule(operatorOf(COUNCIL_A), input);
    if (!m.ok) throw new Error(m.message);
    expect((await s.saveMinutes(operatorOf(COUNCIL_A), { meetingId: m.data.id, text: "Deliberações da reunião" })).ok).toBe(false); // ainda agendada
    await s.changeStatus(operatorOf(COUNCIL_A), { meetingId: m.data.id, to: "realizada" });
    const withMinutes = await s.saveMinutes(operatorOf(COUNCIL_A), { meetingId: m.data.id, text: "Deliberações da reunião" });
    expect(withMinutes.ok && withMinutes.data.minutes?.text).toContain("Deliberações");
  });
  it("reagendar exige nova data e volta a 'agendada'", async () => {
    const s = setup();
    const m = await s.schedule(managerOf(COUNCIL_A), input);
    if (!m.ok) throw new Error();
    expect((await s.changeStatus(managerOf(COUNCIL_A), { meetingId: m.data.id, to: "reagendada" })).ok).toBe(false);
    const r = await s.changeStatus(managerOf(COUNCIL_A), { meetingId: m.data.id, to: "reagendada", newScheduledAt: "2026-11-20T13:00:00Z" });
    expect(r.ok && r.data.status).toBe("agendada");
    expect(r.ok && r.data.scheduledAt.toISOString()).toBe("2026-11-20T13:00:00.000Z");
  });
  it("estados finais não mudam; consulta e conselho alheio sem acesso", async () => {
    const s = setup();
    const m = await s.schedule(managerOf(COUNCIL_A), input);
    if (!m.ok) throw new Error();
    await s.changeStatus(managerOf(COUNCIL_A), { meetingId: m.data.id, to: "cancelada" });
    expect((await s.changeStatus(managerOf(COUNCIL_A), { meetingId: m.data.id, to: "realizada" })).ok).toBe(false);
    expect((await s.schedule(viewerOf(COUNCIL_A), input)).ok).toBe(false);
    expect((await s.get(managerOf(COUNCIL_B), m.data.id)).ok).toBe(false);
  });
  it("itens de ação são acrescentados", async () => {
    const s = setup();
    const m = await s.schedule(managerOf(COUNCIL_A), input);
    if (!m.ok) throw new Error();
    const r = await s.addActionItem(managerOf(COUNCIL_A), { meetingId: m.data.id, description: "Enviar convocação" });
    expect(r.ok && r.data.actionItems).toHaveLength(1);
  });
  it("edita a pauta e os participantes sem criar presença nem afetar tarefas", async () => {
    const service = setup();
    const manager = managerOf(COUNCIL_A);
    const meeting = await service.schedule(manager, input);
    if (!meeting.ok) throw new Error(meeting.message);
    await service.addActionItem(manager, { meetingId: meeting.data.id, description: "Enviar pauta" });
    const details = {
      meetingId: meeting.data.id, title: "Reunião revisada", responsibleId: manager.userId,
      agenda: "Pauta", decisions: "Decisão", participantIds: [manager.userId, manager.userId], attachmentIds: [],
    };
    expect(await service.updateDetails(viewerOf(COUNCIL_A), details)).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(await service.updateDetails(managerOf(COUNCIL_B), details)).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(await service.updateDetails(manager, details)).toEqual({ ok: true, data: true });
    const result = await service.get(manager, meeting.data.id);
    expect(result).toMatchObject({ ok: true, data: { agenda: "Pauta", decisions: "Decisão", participantIds: [manager.userId] } });
    expect(result.ok && result.data.actionItems).toHaveLength(1);
    expect(result.ok && (result.data.attendance ?? [])).toEqual([]);
  });
});
