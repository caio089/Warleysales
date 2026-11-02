import { describe, expect, it } from "vitest";
import { isCronAuthorized } from "@/server/cron/cron-auth";
import { MemoryJobRunRepository, runScheduledJob } from "./job-runner";

const SECRET = "segredo-de-teste-com-16+";

describe("isCronAuthorized", () => {
  it("aceita somente o Bearer correto", () => {
    expect(isCronAuthorized(`Bearer ${SECRET}`, SECRET)).toBe(true);
    expect(isCronAuthorized("Bearer errado", SECRET)).toBe(false);
    expect(isCronAuthorized(SECRET, SECRET)).toBe(false);
    expect(isCronAuthorized(null, SECRET)).toBe(false);
  });
  it("nega tudo sem segredo configurado ou segredo curto", () => {
    expect(isCronAuthorized("Bearer x", undefined)).toBe(false);
    expect(isCronAuthorized("Bearer curto", "curto")).toBe(false);
  });
});

describe("runScheduledJob", () => {
  const now = () => new Date("2026-05-10T12:00:00Z");

  it("executa uma vez por janela diária", async () => {
    const runs = new MemoryJobRunRepository();
    let calls = 0;
    const job = async () => ({ n: ++calls });
    expect((await runScheduledJob("j", job, { runs, now })).status).toBe("executed");
    expect(await runScheduledJob("j", job, { runs, now })).toEqual({ status: "skipped", reason: "already_ran" });
    expect(calls).toBe(1);
  });

  it("janela de outro dia executa de novo; job distinto não conflita", async () => {
    const runs = new MemoryJobRunRepository();
    const job = async () => 1;
    await runScheduledJob("j", job, { runs, now });
    expect((await runScheduledJob("outro", job, { runs, now })).status).toBe("executed");
    const amanha = () => new Date("2026-05-11T12:00:00Z");
    expect((await runScheduledJob("j", job, { runs, now: amanha })).status).toBe("executed");
  });

  it("registra falha sem propagar exceção", async () => {
    const runs = new MemoryJobRunRepository();
    const result = await runScheduledJob("j", async () => { throw new Error("boom"); }, { runs, now });
    expect(result).toEqual({ status: "failed", message: "boom" });
    expect(runs.runs.get("j:2026-05-10")?.status).toBe("failed");
  });
});
