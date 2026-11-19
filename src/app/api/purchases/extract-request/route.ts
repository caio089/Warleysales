import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import mammoth from "mammoth";
import {
  detectRequestDocument,
  extractRequestDocumentText,
} from "@/modules/purchases/request-document-text";
import {
  parseExtractedPurchaseRequest,
  REQUEST_EXTRACTION_SYSTEM_PROMPT,
} from "@/modules/purchases/request-extraction";
import { tryParseExcelTemplate, tryParseWordTemplate } from "@/modules/purchases/request-template-parse";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { getSession } from "@/server/session";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MIN_TEXT_CHARS = 20;
const MAX_PROMPT_CHARS = 35_000;

export async function POST(request: Request) {
  const session = await getSession();
  if (session.status !== "authenticated") {
    return Response.json({ error: "Entre novamente para importar o arquivo." }, { status: 401 });
  }
  if (!canInAnyCouncil(session.actor, "request.create")) {
    return Response.json({ error: "Sem permissão para criar solicitações." }, { status: 403 });
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_FILE_BYTES + 100_000) {
    return Response.json({ error: "O arquivo deve ter até 10 MB." }, { status: 413 });
  }

  try {
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File) || file.size < 5 || file.size > MAX_FILE_BYTES) {
      return Response.json({ error: "Selecione um Excel (.xlsx) ou Word (.docx) de até 10 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = detectRequestDocument(file.name, bytes);
    if (!kind) {
      return Response.json({ error: "Arquivo inválido. Envie um .xlsx ou .docx gerado pelo Excel/Word." }, { status: 400 });
    }

    // 1) Modelo oficial / tabela com as mesmas colunas: preenche vários itens sem IA.
    const templateFields = kind === "xlsx"
      ? tryParseExcelTemplate(bytes)
      : tryParseWordTemplate(
        (await mammoth.convertToHtml({ buffer: Buffer.from(bytes) })).value,
        (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value,
      );

    if (templateFields) {
      return Response.json({
        fields: templateFields,
        kind,
        source: "template",
        truncated: false,
      });
    }

    // 2) Fallback: documento livre → IA.
    if (!process.env.GROQ_API_KEY?.trim()) {
      return Response.json({
        error: "Não reconheci o modelo. Baixe o Excel/Word oficial ou configure GROQ_API_KEY para leitura livre.",
      }, { status: 422 });
    }

    const sourceText = (await extractRequestDocumentText(kind, bytes)).trim();
    if (sourceText.length < MIN_TEXT_CHARS) {
      return Response.json({
        error: "Não há texto suficiente no arquivo. Use o modelo oficial com a tabela Item / Quantidade / Unidade.",
      }, { status: 422 });
    }

    const result = await generateText({
      model: groq("openai/gpt-oss-20b"),
      temperature: 0,
      abortSignal: AbortSignal.timeout(25_000),
      providerOptions: { groq: { reasoningFormat: "hidden", reasoningEffort: "low" } },
      system: REQUEST_EXTRACTION_SYSTEM_PROMPT,
      prompt: sourceText.slice(0, MAX_PROMPT_CHARS),
    });

    const fields = parseExtractedPurchaseRequest(result.text);
    if (!fields) {
      return Response.json({
        error: "Não foi possível interpretar os dados. Baixe o modelo, preencha a tabela e envie de novo.",
      }, { status: 422 });
    }

    return Response.json({
      fields,
      kind,
      source: "ai",
      truncated: sourceText.length > MAX_PROMPT_CHARS,
    });
  } catch {
    return Response.json({
      error: "Não foi possível ler este arquivo. Confira o formato e tente novamente.",
    }, { status: 422 });
  }
}
