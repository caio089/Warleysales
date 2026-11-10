import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/documents/actions", () => ({
  loadProcessDocumentsAction: vi.fn(),
  prepareDocumentUploadAction: vi.fn(),
  confirmDocumentUploadAction: vi.fn(),
  downloadUrlAction: vi.fn(),
}));

import { LinkedProcessCard } from "@/app/(app)/solicitacoes/[id]/linked-process-card";
import { ProcessesTable } from "@/app/(app)/processos/process-attachment-sheet";
import type { ProcessView } from "@/modules/processes/service";
import { ActivityTimeline } from "./activity-timeline";
import { DataSourceUnavailableState, EmptyState, ErrorState } from "./feedback-states";
import { KpiCard } from "./kpi-card";
import { ProgressBar } from "./progress-bar";
import { presentationOf, PROCESS_STATUS } from "./status-presentation";
import { StatusBadge } from "./status-badge";
import { formatBytes } from "@/shared/lib/format";
import { validateFileMeta } from "@/shared/lib/upload-rules";

describe("componentes compartilhados (renderização no servidor)", () => {
  it("ProgressBar expõe semântica ARIA e limita 0–100", () => {
    const html = renderToStaticMarkup(<ProgressBar value={142.857} label="Progresso documental" />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain('aria-label="Progresso documental"');
  });
  it("KpiCard nunca inventa número", () => {
    expect(renderToStaticMarkup(<KpiCard label="Processos" value={null} />)).toContain("—");
  });
  it("estados usam roles de acessibilidade", () => {
    expect(renderToStaticMarkup(<ErrorState />)).toContain('role="alert"');
    expect(renderToStaticMarkup(<EmptyState title="Vazio" />)).toContain('role="status"');
    expect(renderToStaticMarkup(<DataSourceUnavailableState />)).toContain("Fonte de dados não configurada");
  });
  it("StatusBadge mostra texto e status desconhecido não quebra", () => {
    const p = presentationOf(PROCESS_STATUS, "xyz");
    expect(renderToStaticMarkup(<StatusBadge label={p.label} tone={p.tone} />)).toContain("xyz");
  });
  it("timeline ordena do mais recente e exibe fuso de Fortaleza", () => {
    const html = renderToStaticMarkup(
      <ActivityTimeline entries={[
        { id: "1", title: "Antigo", occurredAt: "2026-01-01T12:00:00Z" },
        { id: "2", title: "Novo", occurredAt: "2026-02-01T02:00:00Z" },
      ]} />,
    );
    expect(html.indexOf("Novo")).toBeLessThan(html.indexOf("Antigo"));
    expect(html).toContain("31/01/2026"); // 02:00Z => 23:00 do dia anterior em Fortaleza
  });
  it("formatadores e pré-validação de upload", () => {
    expect(formatBytes(1536)).toBe("1,5 KB");
    expect(validateFileMeta("a.exe", 10)).toMatch(/não permitido/);
    expect(validateFileMeta("a.pdf", 26 * 1024 * 1024)).toMatch(/25 MB/);
    expect(validateFileMeta("a.PDF", 100)).toBeNull();
  });
  it("LinkedProcessCard exibe processo vinculado, badges, progresso e link de anexagem", () => {
    const view: ProcessView = {
      process: {
        id: "proc-123",
        councilId: "council-a",
        sequence: 1,
        year: 2026,
        number: "001/2026",
        title: "Aquisição de computadores",
        status: "em_andamento",
        documentalCompletedAt: null,
        snapshot: null,
        closingReportRegistered: false,
        createdBy: "user-1",
        createdAt: new Date("2026-01-01"),
      },
      progress: {
        validTypes: [],
        missingTypes: ["DFD", "ETP", "MR", "TR", "PP", "PJ", "ED"],
        percent: 0,
        isComplete: false,
      },
      displayPercent: 0,
      completion: "pendente",
    };
    const html = renderToStaticMarkup(<LinkedProcessCard processView={view} />);
    expect(html).toContain("Processo Administrativo Vinculado");
    expect(html).toContain("Processo 001/2026");
    expect(html).toContain("Aquisição de computadores");
    expect(html).toContain("Em andamento");
    expect(html).toContain("Documentação pendente");
    expect(html).toContain("0/7 documentos anexados");
    expect(html).toContain("0 de 7 documentos");
    expect(html).toContain('href="/processos?abrir=proc-123"');
    expect(html).toContain("Anexar documentos do processo →");
  });
  it("ProcessesTable exibe cabeçalhos, dados e botão de ação rápida 'Anexar'", () => {
    const rows = [
      {
        id: "proc-1",
        number: "001/2026",
        title: "Aquisição de computadores",
        council: "Conselho Regional A",
        status: "em_andamento",
        completion: "pendente",
        progress: 42,
        href: "/processos/proc-1",
      },
    ];
    const html = renderToStaticMarkup(<ProcessesTable rows={rows} />);
    expect(html).toContain("001/2026");
    expect(html).toContain("Aquisição de computadores");
    expect(html).toContain("Conselho Regional A");
    expect(html).toContain("Em andamento");
    expect(html).toContain("Documentação pendente");
    expect(html).toContain("42%");
    expect(html).toContain("Anexar");
    expect(html).toContain("Ações");
  });
});
