import { describe, expect, it } from "vitest";
import { authorize, can, readableCouncilIds, type Actor, type PermissionAction } from "./policy";

const A = "council-a";
const B = "council-b";
type Role = "council_manager" | "council_operator" | "viewer";
const actor = (role: Role, overrides: Partial<Actor> = {}): Actor => ({
  userId: "u", isCentralAdmin: false, isSpecialDeleter: false, memberships: [{ councilId: A, role }], ...overrides,
});
const admin = actor("viewer", { isCentralAdmin: true, memberships: [] });

// Expected access is fixed here, independent from can() and policy implementation.
const roleMatrix: readonly [PermissionAction, boolean, boolean, boolean, boolean][] = [
  // action, manager, operator, viewer, central
  ["council.read", true, true, true, true],
  ["council.manage", false, false, false, true],
  ["user.manage", false, false, false, true],
  ["process.create", true, true, false, true],
  ["document.attach", true, true, false, true],
  ["document.unlink", true, false, false, true],
  ["request.create", true, true, false, true],
  // request.decide: só Warley (isSpecialDeleter); admin central comum (Maria Luiza) = false
  ["request.decide", false, false, false, false],
  ["stock.move", true, true, false, true],
  ["stock.adjust", true, false, false, true],
  ["material.manage", true, false, false, true],
  ["supplier.manage", true, false, false, true],
  ["ata.manage", true, false, false, true],
  ["contract.create", true, true, false, true],
  ["contract.manage", true, false, false, true],
  ["meeting.manage", true, true, false, true],
  ["report.view", true, false, true, true],
  ["audit.view", true, false, false, true],
  ["retention.manage", false, false, false, true],
  ["formalization.submit", true, true, false, true],
  ["formalization.homologate", false, false, false, true],
  ["formalization.reject", false, false, false, true],
  ["data.delete_manual", false, false, false, false],
];

describe("matriz explícita de permissões (§6)", () => {
  it.each(roleMatrix)("%s", (action, manager, operator, viewer, central) => {
    expect(can(actor("council_manager"), action, A)).toBe(manager);
    expect(can(actor("council_operator"), action, A)).toBe(operator);
    expect(can(actor("viewer"), action, A)).toBe(viewer);
    expect(can(admin, action, A)).toBe(central);
  });

  it("exige vínculo com conselho alvo e não usa vínculo de outra organização", () => {
    const noMembership = actor("council_manager", { memberships: [] });
    const multiOrg = actor("council_manager", { memberships: [
      { councilId: A, role: "council_manager" }, { councilId: B, role: "viewer" },
    ] });
    expect(can(noMembership, "process.create", A)).toBe(false);
    expect(can(noMembership, "council.read", A)).toBe(false);
    expect(can(multiOrg, "process.create", B)).toBe(false);
    expect(can(multiOrg, "council.read", B)).toBe(true);
    expect(can(multiOrg, "process.create", A)).toBe(true);
    expect(can(multiOrg, "process.create")).toBe(false);
  });

  it("report.view permite viewer e nega operator", () => {
    expect(can(actor("viewer"), "report.view", A)).toBe(true);
    expect(can(actor("council_operator"), "report.view", A)).toBe(false);
  });

  it("data.delete_manual depende apenas de special deleter, não de admin", () => {
    expect(can(admin, "data.delete_manual")).toBe(false);
    expect(can(actor("council_manager", { isSpecialDeleter: true }), "data.delete_manual")).toBe(true);
    expect(can(actor("viewer", { isSpecialDeleter: true, memberships: [] }), "data.delete_manual")).toBe(true);
  });

  it("request.decide é exclusivo do Warley (isSpecialDeleter), não de admin central comum", () => {
    expect(can(admin, "request.decide", A)).toBe(false);
    expect(can(actor("viewer", { isSpecialDeleter: true, memberships: [] }), "request.decide", A)).toBe(true);
    expect(can(actor("council_manager", { isSpecialDeleter: true }), "request.decide", A)).toBe(true);
  });

  it("authorize devolve FORBIDDEN", () => {
    const r = authorize(actor("viewer"), "stock.move", A);
    expect(!r.ok && r.code).toBe("FORBIDDEN");
  });

  it("conselhos legíveis", () => {
    expect(readableCouncilIds(admin)).toBe("all");
    expect(readableCouncilIds(actor("viewer"))).toEqual([A]);
  });
});
