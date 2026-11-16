import type { AuditEntry, AuditFilter } from "@/modules/audit/schemas";
import { auditReportPdf, operationalReportPdf } from "@/modules/reports/pdf";
import { getServices } from "@/server/runtime";
import { getSession } from "@/server/session";
import { toFortalezaDate } from "@/shared/lib/time";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function branding() {
  return {
    institution: process.env.REPORT_INSTITUTION_NAME?.trim() || "Warley - Central Operacional",
    subtitle: process.env.REPORT_INSTITUTION_SUBTITLE?.trim() || "Gestão de solicitações, contratações e estoque",
  };
}

function download(pdf: Uint8Array, name: string) {
  return new Response(pdf as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") return Response.json({ error: "Entre novamente para gerar o relatório." }, { status: 401 });
  const services = getServices();
  if (!services) return Response.json({ error: "Relatórios indisponíveis." }, { status: 503 });
  const params = new URL(request.url).searchParams;
  const kind = params.get("kind") ?? "operational";
  const councilId = params.get("councilId") || undefined;
  if (councilId && !UUID.test(councilId)) return Response.json({ error: "Órgão inválido." }, { status: 400 });
  const councils = await services.councils.list(session.actor);
  const councilLabel = councils.ok && councilId ? councils.data.find((c) => c.id === councilId)?.acronym : undefined;
  const context = {
    branding: branding(), issuedAt: new Date(), issuedBy: session.actor.userId,
    scopeLabel: councilLabel ? `Órgão ${councilLabel}` : "Todos os órgãos autorizados",
  };

  if (kind === "operational") {
    const [summary, savings] = await Promise.all([
      services.reports.operationalSummary(session.actor),
      services.formalizations.getSavingsSummary(session.actor),
    ]);
    if (!summary.ok) return Response.json({ error: summary.message }, { status: summary.code === "FORBIDDEN" ? 403 : 400 });
    const pdf = await operationalReportPdf(summary.data, savings.ok ? savings.data : null, { ...context, scopeLabel: "Todos os órgãos autorizados" });
    return download(pdf, `relatorio-operacional-${toFortalezaDate(new Date())}.pdf`);
  }

  if (kind !== "audit") return Response.json({ error: "Tipo de relatório inválido." }, { status: 400 });
  const filter: AuditFilter = {};
  const entity = params.get("entity");
  const action = params.get("action");
  const actorId = params.get("actorId");
  const result = params.get("result");
  const period = params.get("period");
  if (councilId) filter.councilId = councilId;
  if (entity) filter.entity = entity.slice(0, 100);
  if (action) filter.action = action.slice(0, 100);
  if (actorId && UUID.test(actorId)) filter.actorId = actorId;
  if (result === "success" || result === "denied" || result === "error") filter.result = result;
  if (period === "hoje") filter.startDate = toFortalezaDate(new Date());
  else if (period === "7d" || period === "30d") filter.startDate = new Date(Date.now() - (period === "7d" ? 7 : 30) * 86_400_000).toISOString();
  const exported: AuditEntry[] = [];
  let beforeId: string | undefined;
  let truncated = false;
  for (let batchNumber = 0; batchNumber < 5; batchNumber += 1) {
    const batch = await services.audit.list(session.actor, { ...filter, beforeId });
    if (!batch.ok) return Response.json({ error: batch.message }, { status: batch.code === "FORBIDDEN" ? 403 : 400 });
    exported.push(...batch.data);
    if (batch.data.length < 1000) break;
    beforeId = batch.data.at(-1)?.id;
    if (batchNumber === 4) truncated = true;
  }
  const baseLabels = [councilLabel && `Órgão ${councilLabel}`, entity && `Módulo ${entity}`, action && `Evento ${action}`, actorId && `Usuário ${actorId}`, period && `Período ${period}`, result && `Resultado ${result}`].filter(Boolean).join("; ") || "Sem filtros adicionais";
  const filterLabels = truncated ? `${baseLabels}; limite de 5.000 eventos atingido - refine os filtros para exportar o restante` : baseLabels;
  const pdf = await auditReportPdf(exported, filterLabels, context);
  return download(pdf, `relatorio-auditoria-${toFortalezaDate(new Date())}.pdf`);
}
