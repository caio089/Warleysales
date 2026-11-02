import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
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
});
