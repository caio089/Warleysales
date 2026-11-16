import type { AuditEntry, AuditFilter } from "@/modules/audit/schemas";
import { auditReportPdf, operationalReportPdf } from "@/modules/reports/pdf";
import { demoCouncilIds, savingsForExport } from "@/modules/reports/export-data";
import { getServices } from "@/server/runtime";
import { getSession } from "@/server/session";
import { toFortalezaDate } from "@/shared/lib/time";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function branding() {
  return {
    institution: process.env.REPORT_INSTITUTION_NAME?.trim() || "Relatórios operacionais",
    subtitle: process.env.REPORT_INSTITUTION_SUBTITLE?.trim() || "Dados registrados no sistema",
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
  if (!councils.ok) return Response.json({ error: councils.message }, { status: councils.code === "FORBIDDEN" ? 403 : 400 });
  const councilLabel = councils.ok && councilId ? councils.data.find((c) => c.id === councilId)?.acronym : undefined;
  if (councilId && !councilLabel) return Response.json({ error: "Órgão não encontrado ou sem acesso." }, { status: 404 });
  const context = {
    branding: branding(), issuedAt: new Date(), issuedBy: session.displayName || "Usuário autenticado",
    scopeLabel: councilLabel ? `Órgão ${councilLabel}` : "Todos os órgãos autorizados",
  };

  if (kind === "operational") {
    const excludedIds = demoCouncilIds(councils.data);
    const [summary, formalizations] = await Promise.all([
      services.reports.operationalSummary(session.actor, { councilId, excludeCouncilIds: excludedIds }),
      services.formalizations.listHomologated(session.actor, councilId),
    ]);
    if (!summary.ok) return Response.json({ error: summary.message }, { status: summary.code === "FORBIDDEN" ? 403 : 400 });
    if (!formalizations.ok) return Response.json({ error: formalizations.message }, { status: formalizations.code === "FORBIDDEN" ? 403 : 400 });
    const savings = savingsForExport(formalizations.data.filter((item) => !excludedIds.includes(item.councilId)));
    const pdf = await operationalReportPdf(summary.data, savings, context);
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
  const directory = session.actor.isCentralAdmin ? await services.memberships.directory(session.actor) : null;
  const actorNames = directory?.ok ? Object.fromEntries(directory.data.profiles.map((profile) => [profile.id, profile.fullName])) : {};
  const councilNames = Object.fromEntries(councils.data.map((council) => [council.id, council.acronym]));
  const periodLabels: Record<string, string> = { hoje: "Hoje", "7d": "Últimos 7 dias", "30d": "Últimos 30 dias" };
  const resultLabels: Record<string, string> = { success: "Concluído", denied: "Negado", error: "Erro" };
  const baseLabels = [councilLabel && `Órgão ${councilLabel}`, entity && `Módulo ${entity.replaceAll("_", " ")}`, action && `Evento ${action.replaceAll(".", " · ")}`, actorId && `Usuário ${actorNames[actorId] || `ID ${actorId.slice(0, 8)}`}`, period && `Período ${periodLabels[period] ?? period}`, result && `Resultado ${resultLabels[result] ?? result}`].filter(Boolean).join("; ") || "Sem filtros adicionais";
  const filterLabels = truncated ? `${baseLabels}; limite de 5.000 eventos atingido - refine os filtros para exportar o restante` : baseLabels;
  const pdf = await auditReportPdf(exported, filterLabels, { ...context, actorNames, councilNames });
  return download(pdf, `relatorio-auditoria-${toFortalezaDate(new Date())}.pdf`);
}
