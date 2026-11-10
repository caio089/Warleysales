import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AuditEntry } from "@/modules/audit/schemas";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/relatorios",
  useSearchParams: () => new URLSearchParams(),
}));

import {
  AuditTrailTab,
  extractJustificationOrDetails,
  formatActionLabel,
  formatEntityLabel,
} from "./audit-trail-tab";

describe("AuditTrailTab", () => {
  const councils = [
    { id: "council-a", label: "CRF-SP" },
    { id: "council-b", label: "CRO-RJ" },
  ];
  const councilLabel: Record<string, string> = {
    "council-a": "CRF-SP",
    "council-b": "CRO-RJ",
  };

  const sampleEntries: AuditEntry[] = [
    {
      id: "log-1",
      actorId: "user-1",
      action: "process.close_incomplete",
      entity: "administrative_process",
      entityId: "proc-101",
      councilId: "council-a",
      result: "success",
      details: {
        justification: "Encerramento formal homologado pelo presidente do conselho",
        percent: 85,
      },
      createdAt: new Date("2026-11-10T14:30:00Z"),
    },
    {
      id: "log-2",
      actorId: "user-2",
      action: "order.create",
      entity: "material_order",
      entityId: "ord-202",
      councilId: "council-b",
      result: "success",
      details: {
        number: "PED-2026-001",
        quantity: 50,
      },
      createdAt: new Date("2026-11-09T10:00:00Z"),
    },
    {
      id: "log-3",
      actorId: null,
      action: "retention.archive",
      entity: "retention_schedule",
      entityId: "proc-999",
      councilId: null,
      result: "denied",
      details: {
        reason: "Processo sob custódia judicial com bloqueio ativo",
      },
      createdAt: new Date("2026-11-08T08:00:00Z"),
    },
    {
      id: "log-4",
      actorId: "user-3",
      action: "stock.exit",
      entity: "stock_movement",
      entityId: "mat-55",
      councilId: "council-a",
      result: "error",
      details: {
        reason: "Saldo insuficiente para baixa imediata",
      },
      createdAt: new Date("2026-11-05T12:00:00Z"),
    },
  ];

  it("renderiza os cards de métricas no topo com totalizadores e taxa de conformidade", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
      />,
    );

    expect(html).toContain("Total de Ações");
    expect(html).toContain("4"); // Total de Ações
    expect(html).toContain("Ações Bem-Sucedidas");
    expect(html).toContain("2"); // 2 sucessos
    expect(html).toContain("Negadas e Erros");
    expect(html).toContain("2"); // 1 denied + 1 error
    expect(html).toContain("Taxa de Conformidade");
    expect(html).toContain("50,00%"); // 2 de 4 = 50%
  });

  it("renderiza a barra de filtros completa com todos os controles exigidos", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
      />,
    );

    // Controles de filtro
    expect(html).toContain("Órgão");
    expect(html).toContain("Todos os órgãos");
    expect(html).toContain("CRF-SP");
    expect(html).toContain("CRO-RJ");

    expect(html).toContain("Módulo / Entidade");
    expect(html).toContain("Todos os módulos");
    expect(html).toContain("Processos Administrativos");
    expect(html).toContain("Pedidos de Materiais");

    expect(html).toContain("Usuário / Autor");
    expect(html).toContain("Buscar autor…");

    expect(html).toContain("Período");
    expect(html).toContain("Todos os períodos");
    expect(html).toContain("Hoje");
    expect(html).toContain("Últimos 7 dias");
    expect(html).toContain("Últimos 30 dias");

    expect(html).toContain("Resultado");
    expect(html).toContain("Todos os resultados");
    expect(html).toContain("Sucesso");
    expect(html).toContain("Negado");
    expect(html).toContain("Erro");
  });

  it("renderiza tabela detalhada com colunas estruturadas, ações legíveis e badges", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
      />,
    );

    // Cabeçalhos da tabela
    expect(html).toContain("Data / Hora");
    expect(html).toContain("Órgão");
    expect(html).toContain("Autor");
    expect(html).toContain("Ação");
    expect(html).toContain("Módulo");
    expect(html).toContain("Justificativa / Detalhes");
    expect(html).toContain("Resultado");

    // Conteúdo das linhas
    expect(html).toContain("CRF-SP");
    expect(html).toContain("user-1");
    expect(html).toContain("Encerramento Incompleto");
    expect(html).toContain("process.close_incomplete");
    expect(html).toContain("Processos Administrativos");

    expect(html).toContain("CRO-RJ");
    expect(html).toContain("user-2");
    expect(html).toContain("Criação de Pedido de Material");
    expect(html).toContain("order.create");

    expect(html).toContain("Central"); // conselho null
    expect(html).toContain("Sistema (job)"); // actorId null
    expect(html).toContain("Arquivamento de Processo");

    // Badges de status
    expect(html).toContain("Sucesso");
    expect(html).toContain("Negado");
    expect(html).toContain("Erro");
  });

  it("exibe justificativa circunstanciada para encerramentos e bloqueios", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
      />,
    );

    expect(html).toContain("Encerramento formal homologado pelo presidente do conselho");
    expect(html).toContain("Processo sob custódia judicial com bloqueio ativo");
    expect(html).toContain("Saldo insuficiente para baixa imediata");
  });

  it("filtra registros por órgão quando informado em initialFilters", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
        initialFilters={{ councilId: "council-b" }}
      />,
    );

    expect(html).toContain("CRO-RJ");
    expect(html).not.toContain("Encerramento Incompleto"); // pertence a council-a
    expect(html).toContain("Criação de Pedido de Material");
  });

  it("filtra registros por resultado quando informado em initialFilters", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
        initialFilters={{ result: "denied" }}
      />,
    );

    expect(html).toContain("Arquivamento de Processo");
    expect(html).toContain("Negado");
    expect(html).not.toContain("Encerramento Incompleto"); // sucesso
    expect(html).not.toContain("Saldo insuficiente"); // erro
  });

  it("filtra registros por módulo/entidade quando informado em initialFilters", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
        initialFilters={{ entity: "material_order" }}
      />,
    );

    expect(html).toContain("Pedidos de Materiais");
    expect(html).toContain("Criação de Pedido de Material");
    expect(html).not.toContain("Encerramento Incompleto");
  });

  it("renderiza estado vazio com mensagem amigável quando nenhum registro coincide", () => {
    const html = renderToStaticMarkup(
      <AuditTrailTab
        entries={sampleEntries}
        councils={councils}
        councilLabel={councilLabel}
        initialFilters={{ councilId: "council-inexistente" }}
      />,
    );

    expect(html).toContain("Nenhum registro de auditoria encontrado");
    expect(html).toContain("Limpar Filtros");
  });

  it("helpers extractJustificationOrDetails e formatação funcionam isoladamente", () => {
    expect(extractJustificationOrDetails(null)).toBe("—");
    expect(extractJustificationOrDetails({ justification: "Justificativa teste" })).toBe("Justificativa teste");
    expect(extractJustificationOrDetails({ reason: "Motivo teste" })).toBe("Motivo teste");
    expect(extractJustificationOrDetails({ note: "Nota teste" })).toBe("Nota teste");
    expect(extractJustificationOrDetails({ missingTypes: ["TR", "ETP"] })).toBe("Pendências: TR, ETP");
    expect(extractJustificationOrDetails({ number: "001" })).toBe("Nº 001");
    expect(extractJustificationOrDetails({ quantity: 15 })).toBe("Qtd: 15");

    expect(formatActionLabel("process.close_incomplete")).toBe("Encerramento Incompleto");
    expect(formatActionLabel("acao_customizada_nova")).toBe("Acao Customizada Nova");
    expect(formatEntityLabel("material_order")).toBe("Pedidos de Materiais");
    expect(formatEntityLabel("entidade_customizada")).toBe("Entidade Customizada");
  });
});
