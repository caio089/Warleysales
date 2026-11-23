import { describe, expect, it, vi } from "vitest";
import { fail, ok } from "@/shared/lib/result";
import { COUNCIL_A, managerOf } from "@/shared/testing/fixtures";

const { loadScreenMock, loadLookupsMock } = vi.hoisted(() => ({ loadScreenMock: vi.fn(), loadLookupsMock: vi.fn() }));
vi.mock("@/server/screen", () => ({ loadScreen: loadScreenMock }));
vi.mock("@/server/lookups", () => ({ loadLookups: loadLookupsMock }));
vi.mock("./process-view", () => ({ ProcessView: () => <div>process view</div> }));
vi.mock("@/shared/ui/screen", () => ({ Screen: ({ result }: { result: unknown }) => <div>{JSON.stringify(result)}</div> }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));

import { ProcessContent } from "./page";

describe("process detail required queries", () => {
  it("returns first failed required query and keeps empty success as valid data", async () => {
    const services = {
      processes: { getDetail: vi.fn().mockResolvedValue(ok({ view: { process: { councilId: COUNCIL_A } }, documents: [] })) },
      formalizations: { getByProcess: vi.fn().mockResolvedValue(fail("INTERNAL", "query failed")) },
      suppliers: { list: vi.fn().mockResolvedValue(ok([])) },
      purchases: { findLinkedByProcess: vi.fn().mockResolvedValue(ok(null)) },
      atas: { list: vi.fn().mockResolvedValue(ok([])) },
      contracts: { list: vi.fn().mockResolvedValue(ok([])) },
    } as never;
    loadScreenMock.mockImplementation((fn) => fn({ services, actor: managerOf(COUNCIL_A) }));
    const failed = await ProcessContent({ params: Promise.resolve({ id: "p-1" }), initialTab: "governanca" });
    expect(JSON.stringify(failed)).toContain("query failed");

    const emptyServices = {
      processes: { getDetail: vi.fn().mockResolvedValue(ok({ view: { process: { councilId: COUNCIL_A, number: "1", title: "x" } }, documents: [] })) },
      formalizations: { getByProcess: vi.fn().mockResolvedValue(ok(null)) },
      suppliers: { list: vi.fn().mockResolvedValue(ok([])) },
      purchases: { findLinkedByProcess: vi.fn().mockResolvedValue(ok(null)) },
      atas: { list: vi.fn().mockResolvedValue(ok([])) },
      contracts: { list: vi.fn().mockResolvedValue(ok([])) },
    } as never;
    loadLookupsMock.mockResolvedValue(ok({ materialName: {}, materials: [], councilLabel: {} }));
    loadScreenMock.mockImplementation((fn) => fn({ services: emptyServices, actor: managerOf(COUNCIL_A) }));
    const empty = await ProcessContent({ params: Promise.resolve({ id: "p-1" }), initialTab: "governanca" });
    expect(JSON.stringify(empty)).toContain('"ok":true');
  });
});
