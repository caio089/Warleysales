/**
 * Importa o PCA 2027 do CRCPI (planilha OK - e. PCA 2027.xlsx) no Supabase.
 * Idempotente: IDs estáveis por item. Só cria linhas com SEQ preenchido.
 *
 * Uso: node scripts/import-pca-crcpi-2027.mjs [/caminho/para/pca.xlsx]
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const CRC_ID = "ce212384-1253-4bd7-a8d0-2f3633ffe79a";
const ACTOR_ID = "31ddcba8-8df8-4dfc-8d2b-124e3e783935"; // Warley Sales
const YEAR = 2027;
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STRONG_SERVICE =
  /m[aã]o de obra|terceiriz|assessoria|consultoria|loca[cç][aã]o|manuten[cç][aã]o|seguro|vale alimenta|plano de sa[uú]de|hospedagem|software|link |agenciamento|est[aá]gio|concurso|publica[cç][aã]o|passag|energia el[eé]trica|[aá]gua|esgoto|telefonia|internet|servi[cç]o|licen[cç]as|plataforma|tradu[cç][aã]o|fotogr[aá]fic|v[ií]deo|cerimonial|negativa|impress[aã]o|pabx|outsourcing|coleta|res[ií]duo|medicina|seguran[cç]a|inscri[cç][aã]o|engenharia|obra|reforma|instala[cç][aã]o|ambienta|fiscaliza/i;
const MATERIAL_SIGNAL =
  /aquisi[cç][aã]o de material|materiais de|g[eê]neros|combust[ií]vel|mobili[aá]rio|cadeiras|utens[ií]lios|ve[ií]culos|equipamentos de processamento|sistema de processamento|bandeiras|placas|folder|banner|porta documento|pr[eê]mios|diplomas|medalhas|telefone, interfone|bens m[oó]veis/i;

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
      }),
  );
}

function stableId(label) {
  const hex = createHash("sha1").update(`warleysales-pca-crcpi-2027:${label}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function assertOk(label, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromObject(raw) {
  const text = cleanText(raw);
  if (!text) return "Item do PCA 2027";
  const nicer = text === text.toUpperCase() ? text.charAt(0) + text.slice(1).toLowerCase() : text;
  return nicer.length > 200 ? `${nicer.slice(0, 197)}...` : nicer;
}

function moneyBr(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function priorityLabel(raw) {
  const t = cleanText(raw).toUpperCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (t.includes("ALTA")) return "Alta";
  if (t.includes("MEDIA") || t.includes("MÉDIA")) return "Média";
  if (t.includes("BAIXA")) return "Baixa";
  return "Não informado";
}

function plannedMonth(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return MONTHS[value.getMonth()];
  const text = cleanText(value).toLowerCase();
  if (!text) return "Não informado";
  if (text.includes("out")) return "Out";
  if (text.includes("nov")) return "Nov";
  if (text.includes("dez")) return "Dez";
  if (text.includes("jan")) return "Jan";
  if (text.includes("fev")) return "Fev";
  if (text.includes("mar")) return "Mar";
  if (text.includes("abr")) return "Abr";
  if (text.includes("mai")) return "Mai";
  if (text.includes("jun")) return "Jun";
  if (text.includes("jul")) return "Jul";
  if (text.includes("ago")) return "Ago";
  if (text.includes("set")) return "Set";
  return "Não informado";
}

function groupLabel(raw) {
  const text = cleanText(raw).replace(/\n+/g, " / ");
  if (!text) return "Não informado";
  return text
    .split("/")
    .map((part) => {
      const p = part.trim();
      if (!p) return "";
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(" / ");
}

function contractingForm(raw) {
  const t = cleanText(raw).toUpperCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (t.includes("RENOV")) return "Renovação";
  if (t.includes("CONTRAT")) return "Nova contratação";
  return cleanText(raw) || "Não informado";
}

function natureza(title) {
  if (STRONG_SERVICE.test(title) && !MATERIAL_SIGNAL.test(title)) return "Serviços e mão de obra";
  if (MATERIAL_SIGNAL.test(title)) return "Apenas materiais";
  if (STRONG_SERVICE.test(title)) return "Serviços e mão de obra";
  return "Não informado";
}

function parseEstimated(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = cleanText(value).replace(/\./g, "").replace(",", ".");
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function readItems(xlsxPath) {
  const wb = XLSX.readFile(xlsxPath, { cellDates: true });
  const sheet = wb.Sheets["PCA 2027"] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const items = [];
  for (const row of rows) {
    const seq = row[1];
    if (typeof seq !== "number" || !Number.isFinite(seq)) continue;
    const object = cleanText(row[3]);
    if (!object) continue;
    items.push({
      seq: Math.trunc(seq),
      justification: cleanText(row[2]),
      object,
      kind: cleanText(row[4]),
      estimated: parseEstimated(row[5]),
      planned: row[8],
      priority: row[9],
      account: cleanText(row[10]),
      accountName: cleanText(row[11]),
      project: cleanText(row[12]),
      unit: cleanText(row[13]),
      observation: cleanText(row[14]),
    });
  }
  return items.sort((a, b) => a.seq - b.seq);
}

function buildNote(item, estimated) {
  const valueText = estimated == null ? "a definir" : moneyBr(estimated);
  const valueReading =
    estimated == null
      ? "Valor estimado não gravado: o plano não trouxe valor numérico fechado."
      : `Valor estimado gravado: ${moneyBr(estimated)}.`;
  const bits = [
    `PCA 2027, item ${item.seq}.`,
    `Grupo: ${groupLabel(item.unit)}.`,
    `Prioridade ${priorityLabel(item.priority)}.`,
    `Mês previsto: ${plannedMonth(item.planned)}.`,
    "Vencimento atual: —.",
    `Forma prevista: ${contractingForm(item.kind)}.`,
    `Valor no plano: ${valueText}.`,
    valueReading,
    "Demanda já identificada pelo órgão no PCA.",
    "Solicitação enviada para a assessoria conduzir o processo.",
    "A quantidade 1 é só o marcador desta contratação.",
    "Não é saldo de estoque.",
    `Natureza: ${natureza(item.object)}.`,
  ];
  if (item.justification) bits.push(`Justificativa: ${item.justification}.`);
  if (item.account || item.accountName) {
    bits.push(`Conta contábil: ${[item.account, item.accountName].filter(Boolean).join(" — ")}.`);
  }
  if (item.project) bits.push(`Projeto: ${item.project}.`);
  if (item.observation) bits.push(`Observação do plano: ${item.observation}`);
  return bits.join(" ");
}

async function main() {
  const xlsxPath = resolve(process.argv[2] || "/tmp/pca-crc-2027.xlsx");
  const env = loadEnv();
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const items = readItems(xlsxPath);
  if (items.length === 0) throw new Error("Nenhum item SEQ encontrado na planilha.");
  console.log(`Itens PCA: ${items.length} (${xlsxPath})`);

  const { error: councilErr } = await sb
    .from("councils")
    .update({
      institutional_info:
        "Conselho Regional de Contabilidade do Piauí (CRCPI). PCA 2027 importado a partir da planilha oficial (Anexo I). Cada linha com SEQ virou solicitação com processo administrativo  NNN/2027.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", CRC_ID);
  assertOk("update council", councilErr);

  let created = 0;
  for (const item of items) {
    const processId = stableId(`process:${item.seq}`);
    const requestId = stableId(`request:${item.seq}`);
    const materialId = stableId(`material:${item.seq}`);
    const itemId = stableId(`request-item:${item.seq}`);
    const title = titleFromObject(item.object);
    const estimated = item.estimated;
    const nat = natureza(item.object);
    const unit = nat === "Apenas materiais" ? "un" : "serv";
    const code = `PCA-CRCPI-${String(item.seq).padStart(3, "0")}`;
    const number = `${item.seq}/${YEAR}`;
    const now = new Date(Date.UTC(2026, 10, 27, 12, 30, item.seq % 60)).toISOString();

    // Reaproveita material antigo do CRC pelo código (processos anteriores foram apagados).
    const { data: existingMat, error: findMatErr } = await sb
      .from("materials")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    assertOk(`find material ${code}`, findMatErr);
    const resolvedMaterialId = existingMat?.id ?? materialId;
    const { error: matErr } = await sb.from("materials").upsert(
      { id: resolvedMaterialId, code, name: title, unit, active: true },
      { onConflict: "id" },
    );
    assertOk(`material ${code}`, matErr);

    const { error: procErr } = await sb.from("administrative_processes").upsert(
      {
        id: processId,
        council_id: CRC_ID,
        sequence: item.seq,
        year: YEAR,
        number,
        title,
        status: "em_andamento",
        estimated_value: estimated,
        created_by: ACTOR_ID,
        created_at: now,
        closing_report_registered: false,
      },
      { onConflict: "id" },
    );
    assertOk(`process ${number}`, procErr);

    const { error: reqErr } = await sb.from("purchase_requests").upsert(
      {
        id: requestId,
        council_id: CRC_ID,
        title,
        status: "rascunho",
        process_id: processId,
        estimated_value: estimated,
        created_by: ACTOR_ID,
        created_at: now,
      },
      { onConflict: "id" },
    );
    assertOk(`request ${number}`, reqErr);

    const { error: itemErr } = await sb.from("purchase_request_items").upsert(
      {
        id: itemId,
        request_id: requestId,
        material_id: resolvedMaterialId,
        quantity: 1,
        ata_item_id: null,
        received_total: 0,
      },
      { onConflict: "id" },
    );
    assertOk(`request item ${number}`, itemErr);

    const note = buildNote(item, estimated);
    const { error: evErr } = await sb.from("purchase_request_events").upsert(
      {
        request_id: requestId,
        position: 0,
        from_status: null,
        to_status: "rascunho",
        actor_id: ACTOR_ID,
        at: now,
        note,
      },
      { onConflict: "request_id,position" },
    );
    assertOk(`event ${number}`, evErr);

    created += 1;
    if (created % 10 === 0 || created === items.length) {
      console.log(`… ${created}/${items.length}`);
    }
  }

  const { count: procCount, error: c1 } = await sb
    .from("administrative_processes")
    .select("id", { count: "exact", head: true })
    .eq("council_id", CRC_ID);
  assertOk("count processes", c1);
  const { count: reqCount, error: c2 } = await sb
    .from("purchase_requests")
    .select("id", { count: "exact", head: true })
    .eq("council_id", CRC_ID);
  assertOk("count requests", c2);

  console.log(`OK: importados ${created}. CRCPI agora tem ${procCount} processos e ${reqCount} solicitações.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
