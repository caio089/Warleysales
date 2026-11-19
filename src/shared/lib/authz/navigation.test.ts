import { describe, expect, it } from "vitest";
import { filterNavigation, NAV_GROUPS, NAV_ITEMS } from "./navigation";

const labels = (items: { label: string }[]) => items.map((item) => item.label);

describe("filterNavigation", () => {
  it("admin central vê tudo", () => {
    expect(filterNavigation({ isCentralAdmin: true, roles: [] })).toHaveLength(NAV_ITEMS.length);
  });

  it("usuário de conselho não vê itens exclusivos da administração central", () => {
    const result = labels(filterNavigation({ isCentralAdmin: false, roles: ["council_operator"] }));
    expect(result).not.toContain("Administração");
    expect(result).not.toContain("Órgãos e empresas");
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
  const validGroups = NAV_GROUPS.map((group) => group.id);

  it("tem exatamente os 5 grupos visuais", () => {
    expect(NAV_GROUPS.map((group) => group.id)).toEqual(["inicio", "processos", "estoque", "agenda", "outras"]);
  });

  it("todo item pertence a um grupo válido", () => {
    NAV_ITEMS.forEach((item) => {
      expect(validGroups, `item "${item.label}" tem group inválido: ${item.group}`).toContain(item.group);
    });
  });

  it("todos os grupos existentes têm ao menos um item", () => {
    NAV_GROUPS.forEach((group) => {
      const count = NAV_ITEMS.filter((item) => item.group === group.id).length;
      expect(count, `grupo "${group.label}" não tem itens`).toBeGreaterThan(0);
    });
  });

  it("admin central vê itens em todos os 5 grupos", () => {
    const adminItems = filterNavigation({ isCentralAdmin: true, roles: [] });
    NAV_GROUPS.forEach((group) => {
      const count = adminItems.filter((item) => item.group === group.id).length;
      expect(count, `admin não vê nenhum item no grupo "${group.label}"`).toBeGreaterThan(0);
    });
  });

  it("itens pertencem aos grupos visuais corretos e mantêm ordem", () => {
    const inicioLabels = NAV_ITEMS.filter((item) => item.group === "inicio").map((item) => item.label);
    expect(inicioLabels).toEqual(["Início"]);
    const processosLabels = NAV_ITEMS.filter((item) => item.group === "processos").map((item) => item.label);
    expect(processosLabels).toEqual(["Solicitações", "Processos", "Atas", "Contratos"]);
    const estoqueLabels = NAV_ITEMS.filter((item) => item.group === "estoque").map((item) => item.label);
    expect(estoqueLabels).toEqual(["Consultar estoque", "Entregas", "Transferências"]);
    const agendaLabels = NAV_ITEMS.filter((item) => item.group === "agenda").map((item) => item.label);
    expect(agendaLabels).toEqual(["Calendário", "Reuniões"]);
    const outrasLabels = NAV_ITEMS.filter((item) => item.group === "outras").map((item) => item.label);
    expect(outrasLabels).toEqual(["Órgãos e empresas", "Fornecedores", "Alertas", "Relatórios", "Auditoria", "Administração"]);
  });
});

describe("NAV_ITEMS — baseline", () => {
  it("preserves exact href and permission mapping", () => {
    expect(NAV_ITEMS.map(({ href, allowedRoles, centralOnly }) => [href, allowedRoles, centralOnly ?? false])).toEqual([
      ["/dashboard", ["council_manager", "council_operator", "viewer"], false], ["/conselhos", [], true],
      ["/solicitacoes", ["council_manager", "council_operator", "viewer"], false], ["/processos", ["council_manager", "council_operator", "viewer"], false],
      ["/atas", ["council_manager", "council_operator", "viewer"], false], ["/contratos", ["council_manager", "council_operator", "viewer"], false],
      ["/calendario", ["council_manager", "council_operator", "viewer"], false], ["/fornecedores", ["council_manager", "council_operator", "viewer"], false],
      ["/reunioes", ["council_manager", "council_operator", "viewer"], false], ["/estoque", ["council_manager", "council_operator", "viewer"], false],
      ["/entregas", ["council_manager", "council_operator", "viewer"], false], ["/transferencias", ["council_manager", "council_operator", "viewer"], false],
      ["/alertas", ["council_manager", "council_operator", "viewer"], false], ["/relatorios", ["council_manager", "viewer"], false],
      ["/administracao/auditoria", ["council_manager"], false], ["/administracao", [], true],
    ]);
  });
});
