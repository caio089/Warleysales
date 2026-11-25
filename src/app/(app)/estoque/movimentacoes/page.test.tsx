import { describe, expect, it, vi } from "vitest";
import { fail, ok } from "@/shared/lib/result";
import { COUNCIL_A, managerOf } from "@/shared/testing/fixtures";
const loadScreenMock = vi.hoisted(() => vi.fn());
const loadLookupsMock = vi.hoisted(() => vi.fn());
vi.mock("@/server/screen", () => ({ loadScreen: loadScreenMock }));
vi.mock("@/server/lookups", () => ({ loadLookups: loadLookupsMock }));
vi.mock("@/shared/ui/screen", () => ({ Screen: ({ result }: { result: unknown }) => <pre>{JSON.stringify(result)}</pre> }));
vi.mock("./movement-form", () => ({ MovementForm: () => null }));
vi.mock("@/modules/inventory/actions", () => ({}));
import { Content } from "./page";

describe("stock movements required queries", () => {
  it("propagates movement failures and keeps successful empty result valid", async () => {
    const run = async (listMovements: unknown) => {
      const services = {
        inventory: { listMovements: vi.fn().mockResolvedValue(listMovements) },
        purchases: { list: vi.fn().mockResolvedValue(ok([])) },
        processes: { list: vi.fn().mockResolvedValue(ok([])) },
        atas: { list: vi.fn().mockResolvedValue(ok([])) },
      } as never;
      loadScreenMock.mockImplementation((fn) => fn({ services, actor: managerOf(COUNCIL_A) }));
      loadLookupsMock.mockResolvedValue(ok({
        councils: [{ id: COUNCIL_A, label: "A" }], councilLabel: {}, materials: [], materialLabel: {}, materialName: {},
      }));
      return Content();
    };
    expect(JSON.stringify(await run(fail("INTERNAL", "movement failure")))).toContain("movement failure");
    expect(JSON.stringify(await run(ok([])))).toContain('"ok":true');
  });
});
