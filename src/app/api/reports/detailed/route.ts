import { buildDetailedReport } from "@/modules/reports/detailed";
import { detailedReportPdf } from "@/modules/reports/detailed-pdf";
import { getServices } from "@/server/runtime";
import { getSession } from "@/server/session";
import { parseDetailedFilter } from "@/modules/reports/detailed-filter";

export async function GET(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") return Response.json({ error: "Entre novamente para gerar o relatório." }, { status: 401 });
  const services = getServices();
  if (!services) return Response.json({ error: "Relatórios indisponíveis." }, { status: 503 });
  const filter = parseDetailedFilter(Object.fromEntries(new URL(request.url).searchParams));
  const result = await buildDetailedReport(services, session.actor, filter);
  if (!result.ok) return Response.json({ error: result.message }, { status: result.code === "FORBIDDEN" ? 403 : 400 });
  const pdf = await detailedReportPdf(result.data, session.displayName || "Usuário autenticado", new Date());
  return new Response(pdf as BodyInit, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="relatorio-${filter.kind}.pdf"`, "Cache-Control": "private, no-store" } });
}
