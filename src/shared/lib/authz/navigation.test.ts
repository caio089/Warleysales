import { describe, expect, it } from "vitest";
import { filterNavigation, NAV_GROUPS, NAV_ITEMS } from "./navigation";

const labels = (items: { label: string }[]) => items.map((i) => i.label);

describe("filterNavigation", () => {
  it("admin central vê tudo", () => {
    expect(filterNavigation({ isCentralAdmin: true, roles: [] })).toHaveLength(NAV_ITEMS.length);
  });

  it("usuário de conselho não vê itens exclusivos da administração central", () => {
    const result = labels(filterNavigation({ isCentralAdmin: false, roles: ["council_operator"] }));
    expect(result).not.toContain("Administração");
    expect(result).not.toContain("Empresas");
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

describe("NAV_ITEMS — integridade de grupos", () => {
  const validGroups = NAV_GROUPS.map((g) => g.id);

  it("todo item pertence a um grupo válido", () => {
    NAV_ITEMS.forEach((item) => {
      expect(validGroups, `item "${item.label}" tem group inválido: ${item.group}`).toContain(item.group);
    });
  });

  it("todos os grupos existentes têm ao menos um item", () => {
    NAV_GROUPS.forEach((group) => {
      const count = NAV_ITEMS.filter((i) => i.group === group.id).length;
      expect(count, `grupo "${group.label}" não tem itens`).toBeGreaterThan(0);
    });
  });

  it("admin central vê itens em todos os 4 grupos", () => {
    const adminItems = filterNavigation({ isCentralAdmin: true, roles: [] });
    NAV_GROUPS.forEach((group) => {
      const count = adminItems.filter((i) => i.group === group.id).length;
      expect(count, `admin não vê nenhum item no grupo "${group.label}"`).toBeGreaterThan(0);
    });
  });
});
