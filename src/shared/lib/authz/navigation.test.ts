import { describe, expect, it } from "vitest";
import { filterNavigation, NAV_ITEMS } from "./navigation";

const labels = (items: { label: string }[]) => items.map((i) => i.label);

describe("filterNavigation", () => {
  it("admin central vê tudo", () => {
    expect(filterNavigation({ isCentralAdmin: true, roles: [] })).toHaveLength(NAV_ITEMS.length);
  });

  it("usuário de conselho não vê itens exclusivos da administração central", () => {
    const result = labels(filterNavigation({ isCentralAdmin: false, roles: ["council_operator"] }));
    expect(result).not.toContain("Administração");
    expect(result).not.toContain("Conselhos");
    expect(result).toContain("Processos");
  });

  it("operador não vê relatórios; gestor vê", () => {
    expect(labels(filterNavigation({ isCentralAdmin: false, roles: ["council_operator"] }))).not.toContain("Relatórios");
    expect(labels(filterNavigation({ isCentralAdmin: false, roles: ["council_manager"] }))).toContain("Relatórios");
  });

  it("gestor vê auditoria; operador não", () => {
    expect(labels(filterNavigation({ isCentralAdmin: false, roles: ["council_manager"] }))).toContain("Auditoria");
    expect(labels(filterNavigation({ isCentralAdmin: false, roles: ["council_operator"] }))).not.toContain("Auditoria");
  });

  it("sem papéis não vê nada", () => {
    expect(filterNavigation({ isCentralAdmin: false, roles: [] })).toHaveLength(0);
  });
});
