import { describe, expect, it, vi } from "vitest";
import { fail, ok } from "@/shared/lib/result";
import { COUNCIL_A, managerOf } from "@/shared/testing/fixtures";
const loadScreenMock = vi.hoisted(() => vi.fn());
vi.mock("@/server/screen", () => ({ loadScreen: loadScreenMock }));
vi.mock("next/link", () => ({ default: ({ children }: { children: unknown }) => children }));
vi.mock("@/shared/ui/screen", () => ({ Screen: ({ result }: { result: unknown }) => <pre>{JSON.stringify(result)}</pre> }));
import { CouncilsContent } from "./page";

describe("council list required queries", () => {
  const run = (results: unknown[]) => {
    const services = {
      councils: { list: vi.fn().mockResolvedValue(results[0]) },
      purchases: { list: vi.fn().mockResolvedValue(results[1]) },
      inventory: { listLevels: vi.fn().mockResolvedValue(results[2]) },
    } as never;
    loadScreenMock.mockImplementation((fn) => fn({ services, actor: managerOf(COUNCIL_A) }));
    return CouncilsContent();
  };
  it("propagates required failures and accepts real empty data", async () => {
    expect(JSON.stringify(await run([ok([]), fail("INTERNAL", "purchase failure"), ok([])]))).toContain("purchase failure");
    expect(JSON.stringify(await run([ok([]), ok([]), fail("INTERNAL", "stock failure")]))).toContain("stock failure");
    expect(JSON.stringify(await run([ok([]), ok([]), ok([])]))).toContain('"ok":true');
  });
});
