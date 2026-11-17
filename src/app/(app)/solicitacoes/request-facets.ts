/** Campos de filtro derivados da solicitação, sem coluna extra no banco. */

export const NOT_INFORMED = "Não informado";

export const PRIORITY_ORDER = ["Alta", "Média", "Baixa", NOT_INFORMED] as const;

export const VALUE_BAND_ORDER = [
  "Sem valor estimado",
  "Até R$ 10 mil",
  "R$ 10 mil a R$ 50 mil",
  "R$ 50 mil a R$ 200 mil",
  "Acima de R$ 200 mil",
] as const;

export const ORIGIN_ORDER = ["Demanda do PCA 2027", "Sugestão do PCA", "Cadastro avulso"] as const;

/** Meses simples primeiro; faixas compostas e textos livres ficam depois, em ordem alfabética. */
export const MONTH_ORDER = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
  "Dez/Jan",
  "Jan/Fev",
  "Fev/Mar",
  "Mar/Abr",
  "Abr/Mai",
  "Mai/Jun",
  "Jun/Jul",
  "Jul/Ago",
  "Ago/Set",
  "1º trim.",
  "2º trim.",
  "3º trim.",
  "4º trim.",
  "1º sem.",
  "2º sem.",
] as const;

export const NATUREZA_ORDER = ["Apenas materiais", "Serviços e mão de obra", NOT_INFORMED] as const;

export interface RequestFacets {
  priority: string;
  group: string;
  plannedMonth: string;
  valueBand: string;
  origin: string;
  natureza: string;
}

export interface PlanDate {
  /** Texto como está no plano, inclusive observações como [VERIFICAR]. */
  raw: string;
  /** Dia identificado, no formato AAAA-MM-DD. */
  day: string | null;
  /** Mês e ano quando o plano não traz o dia. */
  monthLabel: string | null;
}

export interface PlanDossier {
  itemNumber: string | null;
  group: string;
  priority: string;
  plannedMonth: string;
  expiry: PlanDate | null;
  needsVerification: boolean;
  contractingForm: string;
  planValueText: string;
  origin: string;
  valueBand: string;
  valueReading: string;
  instruments: string[];
  natureza: string;
}

/** Faixa usada no filtro de valor. Nulo significa que o plano não fechou o número. */
export function valueBand(amount: number | null | undefined): string {
  if (amount == null) return "Sem valor estimado";
  if (amount <= 10_000) return "Até R$ 10 mil";
  if (amount <= 50_000) return "R$ 10 mil a R$ 50 mil";
  if (amount <= 200_000) return "R$ 50 mil a R$ 200 mil";
  return "Acima de R$ 200 mil";
}

/** Mão de obra, locação e manutenção saem da lista de materiais mesmo se a IA errar. */
const STRONG_SERVICE = /m[aã]o de obra|terceiriz|assessoria|consultoria|loca[cç][aã]o|locacao|manuten[cç][aã]o|seguro|vale-alimenta|benef[ií]cio de alimenta|plano de sa[uú]de|credenciamento|dedetiza|vigil[aâ]ncia|monitoramento|hospedagem|antiv[ií]rus|firewall|software|link de |agenciamento|est[aá]gio|concurso|cobran[cç]a|certificado digital|pmoc|bombeiro|res[ií]duo|energia el[eé]trica|[aá]gua e esgoto|limpeza predial|posto de trabalho|cerimonial|capacita|publica[cç][aã]o|passag|transporte escolar|transporte de pessoas/i;

/** Só vale quando o objeto não é, ele mesmo, um bem. */
const WEAK_SERVICE = /telefonia|internet|\beventos?\b/i;

const MATERIAL_SIGNAL = /material de |materiais de |g[eê]neros aliment|medicamento|insumo|epi\b|material did|equipamento|eletrodom|pe[cç]as|lentes|arma[cç]|oxig[eê]nio|uniforme|mobili[aá]rio|g[eê]neros|combust[ií]ve/i;

export function guardNatureza(title: string, aiKind: "material" | "servico"): "Apenas materiais" | "Serviços e mão de obra" {
  if (STRONG_SERVICE.test(title)) return "Serviços e mão de obra";
  if (MATERIAL_SIGNAL.test(title)) return "Apenas materiais";
  if (WEAK_SERVICE.test(title)) return "Serviços e mão de obra";
  return aiKind === "material" ? "Apenas materiais" : "Serviços e mão de obra";
}

export function naturezaFromNotes(notes: readonly (string | null | undefined)[]): string {
  const found = joinedNotes(notes).match(/Natureza:\s*(Apenas materiais|Serviços e mão de obra)/i);
  if (!found?.[1]) return NOT_INFORMED;
  return /materiais/i.test(found[1]) ? "Apenas materiais" : "Serviços e mão de obra";
}

function priorityLabel(raw: string | undefined): string {
  if (!raw) return NOT_INFORMED;
  if (/^alta$/i.test(raw)) return "Alta";
  if (/^m[eé]dia$/i.test(raw)) return "Média";
  if (/^baixa$/i.test(raw)) return "Baixa";
  return raw.trim();
}

const MONTH_NAME: Record<string, string> = {
  jan: "janeiro", fev: "fevereiro", mar: "março", abr: "abril", mai: "maio", jun: "junho",
  jul: "julho", ago: "agosto", set: "setembro", out: "outubro", nov: "novembro", dez: "dezembro",
};

function joinedNotes(notes: readonly (string | null | undefined)[]): string {
  return notes.filter((note): note is string => Boolean(note?.trim())).join(" ");
}

/** Trecho entre dois rótulos do histórico, sem o ponto final que separa as frases. */
function sliceBetween(text: string, start: string, end: string): string | null {
  const from = text.toLowerCase().indexOf(start.toLowerCase());
  if (from < 0) return null;
  const rest = text.slice(from + start.length);
  const until = rest.toLowerCase().indexOf(end.toLowerCase());
  const chunk = until < 0 ? (rest.split(/\.\s/)[0] ?? rest) : rest.slice(0, until);
  const raw = chunk.trim().replace(/\.+\s*$/, "").trim();
  return raw || null;
}

/** Identifica dia completo ou só mês/ano dentro do vencimento escrito no plano. */
export function identifyPlanDate(raw: string | null): PlanDate | null {
  if (!raw || raw === "—" || /^n[aã]o informado$/i.test(raw) || /^encerrado$/i.test(raw)) {
    return raw && !/^n[aã]o informado$/i.test(raw) ? { raw, day: null, monthLabel: null } : null;
  }
  const day = raw.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (day) {
    const [, d, m, y] = day;
    return { raw, day: `${y}-${m}-${d}`, monthLabel: null };
  }
  const month = raw.match(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\/(\d{4})\b/i);
  if (month) {
    const key = month[1]!.toLowerCase();
    return { raw, day: null, monthLabel: `${MONTH_NAME[key]} de ${month[2]}` };
  }
  return { raw, day: null, monthLabel: null };
}

function citedInstruments(text: string): string[] {
  const matches = text.match(/\b(?:Contrato|Ata|Inexigibilidade|Dispensa|Concorrência|Credenciamento|PE|Inex\.|Disp\.|Cred\.)\s*(?:nº|n\.º|n°)?\s*\d[\d./]*/gi) ?? [];
  return [...new Set(matches.map((item) => item.replace(/\s+/g, " ").trim()))];
}

/**
 * Abre o histórico do PCA em campos: datas, forma, valor e objeto citado.
 * Solicitação avulsa volta com os campos vazios de plano.
 */
export function planDossier(notes: readonly (string | null | undefined)[], estimatedValue: number | null | undefined, objectText = ""): PlanDossier {
  const text = joinedNotes(notes);
  const priority = priorityLabel(text.match(/Prioridade\s+(Alta|M[eé]dia|Baixa)/i)?.[1]);
  const group = text.match(/Grupo:\s*(.+?)\.\s*Prioridade/i)?.[1]?.trim() || NOT_INFORMED;
  const plannedMonth = sliceBetween(text, "Mês previsto:", "Vencimento atual:") ?? NOT_INFORMED;
  const expiryRaw = sliceBetween(text, "Vencimento atual:", "Forma prevista:");
  const contractingForm = sliceBetween(text, "Forma prevista:", "Valor no plano:") ?? NOT_INFORMED;
  const planValueText = sliceBetween(text, "Valor no plano:", "Valor estimado") ?? NOT_INFORMED;
  const valueReading = sliceBetween(text, "Valor estimado", "A quantidade 1") ?? "";
  const origin = /Sugest[aã]o do plano/i.test(text)
    ? "Sugestão do PCA"
    : /PCA\s*2027/i.test(text)
      ? "Demanda do PCA 2027"
      : "Cadastro avulso";
  return {
    itemNumber: text.match(/PCA\s*2027,\s*item\s+(\d+)/i)?.[1] ?? null,
    group,
    priority,
    plannedMonth,
    expiry: identifyPlanDate(expiryRaw),
    needsVerification: /\[VERIFICAR\]/i.test(text),
    contractingForm,
    planValueText,
    origin,
    valueBand: valueBand(estimatedValue),
    valueReading: valueReading ? `Valor estimado ${valueReading}` : "",
    instruments: citedInstruments(`${objectText} ${contractingForm}`),
    natureza: naturezaFromNotes(notes),
  };
}

/**
 * Lê prioridade, grupo, mês e origem a partir do histórico.
 * O texto do PCA fica na observação da criação; solicitações avulsas caem em "Não informado".
 */
export function requestFacets(notes: readonly (string | null | undefined)[], estimatedValue: number | null | undefined): RequestFacets {
  const dossier = planDossier(notes, estimatedValue);
  return {
    priority: dossier.priority,
    group: dossier.group,
    plannedMonth: dossier.plannedMonth,
    valueBand: dossier.valueBand,
    origin: dossier.origin,
    natureza: dossier.natureza,
  };
}
