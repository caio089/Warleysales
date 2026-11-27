import { describe, expect, it, vi } from "vitest";
import { fail, ok } from "@/shared/lib/result";
import { COUNCIL_A, managerOf } from "@/shared/testing/fixtures";
const loadScreenMock = vi.hoisted(() => vi.fn());
const loadLookupsMock = vi.hoisted(() => vi.fn());
vi.mock("@/server/screen", () => ({ loadScreen: loadScreenMock }));
vi.mock("@/server/lookups", () => ({ loadLookups: loadLookupsMock }));
vi.mock("next/link", () => ({ default: ({ children }: { children: unknown }) => children }));
vi.mock("@/shared/ui/screen", () => ({ Screen: ({ result }: { result: unknown }) => <pre>{JSON.stringify(result)}</pre> }));
vi.mock("../new-council-form", () => ({ EditCouncilForm: () => null }));
vi.mock("@/modules/identity/council-actions", () => ({}));
import { CouncilContent } from "./council-detail-page";

describe("council detail required queries", () => {
  it("propagates required query failures and preserves empty successful results", async () => {
    const createServices = () => ({
      councils: { get: vi.fn().mockResolvedValue(ok({ id: COUNCIL_A, acronym: "A", name: "Council", organizationType: "public", institutionalInfo: null, whatsappE164: null })) },
      purchases: { list: vi.fn().mockResolvedValue(ok([])) },
      inventory: { listLevels: vi.fn().mockResolvedValue(ok([])) },
      meetings: { list: vi.fn().mockResolvedValue(ok([])) },
    });
    const run = async (patch: Record<string, unknown> = {}, lookupResult = ok({ councils: [], councilLabel: {}, materials: [], materialLabel: {}, materialName: {} })) => {
      const services = { ...createServices(), ...patch };
      loadScreenMock.mockImplementation((fn) => fn({ services, actor: managerOf(COUNCIL_A) }));
      loadLookupsMock.mockResolvedValue(lookupResult);
      return CouncilContent({ params: Promise.resolve({ id: COUNCIL_A }) });
    };
    expect(JSON.stringify(await run({ purchases: { list: vi.fn().mockResolvedValue(fail("INTERNAL", "purchase failure")) } }))).toContain("purchase failure");
    expect(JSON.stringify(await run({ inventory: { listLevels: vi.fn().mockResolvedValue(fail("INTERNAL", "stock failure")) } }))).toContain("stock failure");
    expect(JSON.stringify(await run({ meetings: { list: vi.fn().mockResolvedValue(fail("INTERNAL", "meeting failure")) } }))).toContain("meeting failure");
    expect(JSON.stringify(await run({}, fail("FORBIDDEN", "lookup materials failure")))).toContain("lookup materials failure");
    expect(JSON.stringify(await run())).toContain('"ok":true');
  });
});
