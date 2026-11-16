import type { AuditFilter } from "@/modules/audit/schemas";
import { getServices } from "@/server/runtime";
import { getSession } from "@/server/session";
import { toFortalezaDate } from "@/shared/lib/time";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") return Response.json({ error: "Entre novamente para consultar a auditoria." }, { status: 401 });
  const services = getServices();
  if (!services) return Response.json({ error: "Auditoria indisponível." }, { status: 503 });
  const params = new URL(request.url).searchParams;
  const beforeId = params.get("beforeId") ?? "";
  if (!/^\d{1,20}$/.test(beforeId)) return Response.json({ error: "Cursor inválido." }, { status: 400 });

  const filter: AuditFilter = { beforeId };
  const councilId = params.get("councilId");
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

  const entries = await services.audit.list(session.actor, filter);
  if (!entries.ok) return Response.json({ error: entries.message }, { status: entries.code === "FORBIDDEN" ? 403 : 400 });
  return Response.json({ entries: entries.data }, { headers: { "Cache-Control": "private, no-store" } });
}
