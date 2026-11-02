import type { Actor } from "@/shared/lib/authz/policy";
import type { RuntimeDeps } from "@/shared/lib/service-support";

/** Fixtures compartilhadas pelos testes de serviço (não usadas em telas). */
export const COUNCIL_A = "11111111-1111-4111-8111-111111111111";
export const COUNCIL_B = "22222222-2222-4222-8222-222222222222";

export const makeActor = (overrides: Partial<Actor> = {}): Actor => ({
  userId: crypto.randomUUID(),
  isCentralAdmin: false,
  isSpecialDeleter: false,
  memberships: [],
  ...overrides,
});

export const managerOf = (councilId: string) => makeActor({ memberships: [{ councilId, role: "council_manager" }] });
export const operatorOf = (councilId: string) => makeActor({ memberships: [{ councilId, role: "council_operator" }] });
export const viewerOf = (councilId: string) => makeActor({ memberships: [{ councilId, role: "viewer" }] });
export const centralAdmin = () => makeActor({ isCentralAdmin: true });
export const specialDeleter = () => makeActor({ isSpecialDeleter: true });

/** Relógio controlável + ids reais (UUID v4) para testes determinísticos de tempo. */
export function makeRuntime(start = "2026-11-02T12:00:00Z") {
  let current = new Date(start);
  const runtime: RuntimeDeps & { advanceDays: (days: number) => void; set: (iso: string) => void } = {
    now: () => new Date(current),
    newId: () => crypto.randomUUID(),
    advanceDays: (days) => { current = new Date(current.getTime() + days * 86_400_000); },
    set: (iso) => { current = new Date(iso); },
  };
  return runtime;
}
