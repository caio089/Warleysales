import { describe, expect, it, vi } from "vitest";
import { fail, ok } from "@/shared/lib/result";
import { loadLookups } from "./lookups";

vi.mock("server-only", () => ({}));

const context = (materials: unknown) => ({
  actor: {} as never,
  services: {
    councils: { list: vi.fn().mockResolvedValue(ok([])) },
    inventory: { listMaterials: vi.fn().mockResolvedValue(materials) },
  } as never,
});

describe("loadLookups", () => {
  it("retains legitimate empty lookup results", async () => {
    const result = await loadLookups(context(ok([])));

    expect(result).toMatchObject({ ok: true, data: { councils: [], materials: [] } });
  });

  it("propagates required material lookup failures unchanged", async () => {
    const failure = fail("FORBIDDEN", "Sem acesso");
    const result = await loadLookups(context(failure));

    expect(result).toBe(failure);
  });
});
