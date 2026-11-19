import {
  buildRequestExcelTemplate,
  buildRequestWordTemplate,
} from "@/modules/purchases/request-template";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { getSession } from "@/server/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") {
    return Response.json({ error: "Entre novamente para baixar o modelo." }, { status: 401 });
  }
  if (!canInAnyCouncil(session.actor, "request.create")) {
    return Response.json({ error: "Sem permissão para criar solicitações." }, { status: 403 });
  }

  const format = new URL(request.url).searchParams.get("format")?.toLowerCase();
  if (format !== "xlsx" && format !== "docx") {
    return Response.json({ error: "Informe format=xlsx ou format=docx." }, { status: 400 });
  }

  try {
    if (format === "xlsx") {
      const bytes = buildRequestExcelTemplate();
      return new Response(Buffer.from(bytes), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="modelo-solicitacao.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }

    const bytes = await buildRequestWordTemplate();
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="modelo-solicitacao.docx"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "Não foi possível gerar o modelo agora." }, { status: 500 });
  }
}
