import { describe, expect, it } from "vitest";
import { dedupKey, reachedMilestone, selectDueAlerts, type AlertCandidate } from "./milestones";
import { addDays, addMonths, diffInDays, formatDateOnly, isValidDateOnly, toFortalezaDate } from "@/shared/lib/time";

const cand = (endDate: string, id = "a1", recipientId = "u1"): AlertCandidate => ({ entityType: "ata", entityId: id, endDate, recipientId });

describe("marcos de alerta 90/60/30/15/7/0", () => {
  it.each([
    [120, null], [90, 90], [75, 90], [60, 60], [31, 60], [30, 30], [15, 15], [8, 15], [7, 7], [1, 7], [0, 0], [-10, 0],
  ])("%s dias restantes => marco %s", (remaining, milestone) => {
    expect(reachedMilestone(addDays("2026-11-02", remaining), "2026-11-02")).toBe(milestone);
  });
  it("deduplica entre execuções", () => {
    const today = "2026-11-02";
    const first = selectDueAlerts([cand(addDays(today, 30))], today, new Set());
    expect(first).toHaveLength(1);
    const second = selectDueAlerts([cand(addDays(today, 30))], addDays(today, 1), new Set(first.map((d) => d.key)));
    expect(second).toHaveLength(0);
  });
  it("avança ao próximo marco depois do anterior", () => {
    const sent = new Set([dedupKey(cand("2026-12-02"), 30)]);
    const next = selectDueAlerts([cand("2026-12-02")], "2026-11-20", sent);
    expect(next[0]?.milestone).toBe(15);
  });
  it("não repete a mesma chave para o mesmo destinatário na mesma varredura", () => {
    const list = [cand("2026-11-20"), cand("2026-11-20")];
    expect(selectDueAlerts(list, "2026-11-02", new Set())).toHaveLength(1);
  });
  it("destinatários distintos recebem alertas distintos", () => {
    const list = [cand("2026-11-20", "a1", "u1"), cand("2026-11-20", "a1", "u2")];
    expect(selectDueAlerts(list, "2026-11-02", new Set())).toHaveLength(2);
  });
});

describe("fuso America/Fortaleza e datas civis", () => {
  it("02:00Z do dia 3 ainda é dia 2 em Fortaleza", () => {
    expect(toFortalezaDate(new Date("2026-11-03T02:00:00Z"))).toBe("2026-11-02");
    expect(toFortalezaDate(new Date("2026-11-03T03:00:00Z"))).toBe("2026-11-03");
  });
  it("aritmética de datas", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(diffInDays("2026-01-01", "2026-03-01")).toBe(59);
    expect(isValidDateOnly("2026-02-30")).toBe(false);
    expect(formatDateOnly("2026-11-02")).toBe("02/11/2026");
  });
});
