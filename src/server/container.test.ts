import { describe, expect, it } from "vitest";
import { COUNCIL_A, makeRuntime, managerOf } from "@/shared/testing/fixtures";
import { createServices } from "./container";
import { createMemoryRepositories } from "./memory-repositories";

describe("raiz de composição", () => {
  it("liga todos os serviços e executa um fluxo ponta a ponta em memória", async () => {
    const runtime = makeRuntime();
    const services = createServices(createMemoryRepositories(runtime.now), runtime);
    const manager = managerOf(COUNCIL_A);
    const created = await services.processes.create(manager, { councilId: COUNCIL_A, number: "001/2026", title: "Processo de teste" });
    expect(created.ok).toBe(true);
    const audit = await services.audit.list(manager);
    expect(audit.ok && audit.data.some((e) => e.action === "process.create")).toBe(true);
    expect(services.formalizations).toBeDefined();
    expect(services.orders).toBeDefined();
    expect(Object.keys(services)).toHaveLength(17);
  });
});
