import { describe, expect, it } from "vitest";
import { authorize, can, readableCouncilIds, type Actor, type PermissionAction } from "./policy";

const A = "council-a";
const B = "council-b";
const actor = (role: "council_manager" | "council_operator" | "viewer", overrides: Partial<Actor> = {}): Actor => ({
  userId: "u", isCentralAdmin: false, isSpecialDeleter: false, memberships: [{ councilId: A, role }], ...overrides,
});
const admin = actor("viewer", { isCentralAdmin: true, memberships: [] });

describe("matriz de permissões (§6)", () => {
  it.each<[PermissionAction, boolean, boolean, boolean, boolean]>([
    // ação, admin, gestor, operador, consulta
    ["council.manage", true, false, false, false],
    ["process.create", true, true, true, false],
    ["document.attach", true, true, true, false],
    ["document.unlink", true, true, false, false],
    ["request.create", true, true, true, false],
    ["request.decide", true, true, false, false],
    ["transfer.decide", true, true, false, false],
    ["stock.move", true, true, true, false],
    ["stock.adjust", true, true, false, false],
    ["ata.manage", true, true, false, false],
    ["contract.manage", true, true, false, false],
    ["audit.view", true, true, false, false],
    ["council.read", true, true, true, true],
    ["data.delete_manual", false, false, false, false],
  ])("%s", (action, isAdmin, isManager, isOperator, isViewer) => {
    expect(can(admin, action, A)).toBe(isAdmin);
    expect(can(actor("council_manager"), action, A)).toBe(isManager);
    expect(can(actor("council_operator"), action, A)).toBe(isOperator);
    expect(can(actor("viewer"), action, A)).toBe(isViewer);
  });

  it("isola por conselho: vínculo em A não vale em B", () => {
    expect(can(actor("council_manager"), "process.create", B)).toBe(false);
    expect(can(actor("council_manager"), "process.create")).toBe(false);
  });
  it("R13: só o is_special_deleter exclui manualmente; admin central não", () => {
    expect(can(admin, "data.delete_manual")).toBe(false);
    expect(can(actor("viewer", { isSpecialDeleter: true }), "data.delete_manual")).toBe(true);
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
