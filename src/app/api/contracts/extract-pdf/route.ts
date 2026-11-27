import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { extractText, getDocumentProxy } from "unpdf";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { parseExtractedContract } from "@/modules/contracts/pdf-extraction";
import { getSession } from "@/server/session";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") return Response.json({ error: "Entre novamente para ler o PDF." }, { status: 401 });
  if (!canInAnyCouncil(session.actor, "contract.create")) return Response.json({ error: "Sem permissão para cadastrar contratos." }, { status: 403 });
  if (!process.env.GROQ_API_KEY?.trim()) return Response.json({ error: "Leitura por IA indisponível: configure GROQ_API_KEY." }, { status: 503 });
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_FILE_BYTES + 100_000) return Response.json({ error: "O PDF deve ter até 10 MB." }, { status: 413 });
  try {
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File) || file.size < 5 || file.size > MAX_FILE_BYTES || file.type !== "application/pdf") {
      return Response.json({ error: "Selecione um PDF de até 10 MB." }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") return Response.json({ error: "O arquivo não é um PDF válido." }, { status: 400 });
    const pdf = await getDocumentProxy(bytes);
    try {
      if (pdf.numPages > 30) return Response.json({ error: "O PDF deve ter no máximo 30 páginas." }, { status: 400 });
      const extracted = await extractText(pdf, { mergePages: true });
      const sourceText = String(extracted.text).trim();
      if (sourceText.length < 40) return Response.json({ error: "Este PDF não contém texto suficiente. Para documento digitalizado, faça OCR antes de enviar." }, { status: 422 });
      const result = await generateText({
        model: groq("openai/gpt-oss-20b"),
        temperature: 0,
        abortSignal: AbortSignal.timeout(20_000),
        providerOptions: { groq: { reasoningFormat: "hidden", reasoningEffort: "low" } },
        system:
          "Extraia dados de um contrato em português do Brasil. Use somente o texto fornecido. " +
          "Para dados ausentes ou ambíguos, use null. Não confunda valor global com valor mensal nem início/fim com data de assinatura. " +
          "Datas em AAAA-MM-DD e valores em número decimal. " +
          "Em items, liste cada item/material com description, quantity, unitPrice e lineTotal (quantity*unitPrice quando possível). " +
          "Some value com a soma dos lineTotal quando o valor global não estiver explícito. " +
          "Responda apenas JSON válido com as chaves supplierName, supplierCnpj, number, object, startDate, endDate, value, items.",
        prompt: sourceText.slice(0, 35_000),
      });
      const fields = parseExtractedContract(result.text);
      if (!fields) return Response.json({ error: "Não foi possível interpretar os dados do PDF. Preencha o formulário manualmente." }, { status: 422 });
      return Response.json({ fields, pages: pdf.numPages, truncated: sourceText.length > 35_000 });
    } finally {
      await pdf.destroy();
    }
  } catch {
    return Response.json({ error: "Não foi possível ler este PDF. Confira o arquivo e tente novamente." }, { status: 422 });
  }
}
