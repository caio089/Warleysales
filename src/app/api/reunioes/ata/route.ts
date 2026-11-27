import { detailedReportPdf } from "@/modules/reports/detailed-pdf";
import { getSession } from "@/server/session";
import { getServices } from "@/server/runtime";
import { idSchema } from "@/shared/lib/service-support";
import { formatDateTimeFortaleza } from "@/shared/lib/time";

export async function GET(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") return new Response(null, { status: 401 });
  const id = idSchema.safeParse(new URL(request.url).searchParams.get("reuniao"));
  const services = getServices();
  if (!id.success || !services) return new Response(null, { status: 404 });
  const result = await services.meetings.get(session.actor, id.data);
  if (!result.ok) return new Response(null, { status: 404 });
  const meeting = result.data, minutes = meeting.minutes;
  if (!minutes) return new Response(null, { status: 404 });
  const pdf = await detailedReportPdf({
    title: meeting.minutesApprovedAt ? "Ata de reunião aprovada" : "Ata de reunião registrada manualmente",
    summary: meeting.title, filters: [], limitations: [], columns: ["Texto registrado"],
    indicators: [{ label: "Reunião (Fortaleza)", value: formatDateTimeFortaleza(meeting.scheduledAt) },
      { label: "Registro da ata", value: formatDateTimeFortaleza(minutes.registeredAt) }],
    rows: minutes.text.split(/\r?\n/).map((line) => [line]),
  }, session.displayName || "Usuário autenticado", new Date());
  return new Response(pdf as BodyInit, { headers: { "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="ata-reuniao.pdf"', "Cache-Control": "private, no-store" } });
}
