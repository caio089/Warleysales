import type { DetailedReport } from "./detailed";

export interface ReportNames {
  councils: { id: string; label: string }[];
  suppliers: { id: string; label: string }[];
  materials: { id: string; label: string }[];
  people: { id: string; label: string }[];
  atas: { id: string; label: string }[];
}

const terms: Record<string, string> = {
  em_andamento: "Em andamento", aguardando_providencia: "Aguardando providência", concluido: "Concluído", cancelado: "Cancelado", arquivado: "Arquivado",
  vigente: "Vigente", vencido: "Vencido", encerrado: "Encerrado", cancelada: "Cancelada", rascunho: "Rascunho",
  registro_precos: "Registro de preços", contrato: "Somente contrato",
  entry: "Entrada", consumption: "Saída", adjustment_in: "Ajuste de entrada", adjustment_out: "Ajuste de saída", transfer_in: "Transferência recebida", transfer_out: "Transferência enviada",
  success: "Concluído", failure: "Falhou",
};

function readable(value: string, names?: Map<string, string>) {
  return names?.get(value) ?? terms[value] ?? (value === "—" || value === "Não informado" ? value : /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value) ? "Não identificado" : value.replaceAll("_", " "));
}

function localDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : value;
}

export function presentDetailedReport(data: DetailedReport, names: ReportNames): DetailedReport {
  const councils = new Map(names.councils.map((item) => [item.id, item.label]));
  const suppliers = new Map(names.suppliers.map((item) => [item.id, item.label]));
  const materials = new Map(names.materials.map((item) => [item.id, item.label]));
  const people = new Map(names.people.map((item) => [item.id, item.label]));
  const atas = new Map(names.atas.map((item) => [item.id, item.label]));
  const columnNames: Record<string, Map<string, string>> = { "Órgão": councils, "Empresa (ID)": suppliers, "Ata (ID)": atas, "Criado por": people, "Responsável": people, "Autor": people, "Produto": materials };
  const skipColumns = new Set(["ID"]);
  const kept = data.columns.map((column, index) => ({ column, index })).filter(({ column }) => !skipColumns.has(column));
  return {
    ...data,
    columns: kept.map(({ column }) => column.replace(" (ID)", "")),
    rows: data.rows.map((row) => kept.map(({ column, index }) => {
      const value = row[index] ?? "—";
      if (["Data", "Criação", "Registro", "Fim"].includes(column)) return localDate(value);
      if (column === "Referência" && value.startsWith("request:")) return "Solicitação";
      return readable(value, columnNames[column]);
    })),
    indicators: data.indicators.map((item) => ({ ...item, label: readable(item.label) })),
    filters: data.filters.map((item) => {
      const [label, ...rest] = item.split(": ");
      const value = rest.join(": ");
      const byLabel: Record<string, Map<string, string>> = { "Órgão": councils, "Empresa": suppliers, "Produto": materials, "Colaborador": people, "Responsável": people };
      return value ? `${label}: ${["De", "Até"].includes(label) ? localDate(value) : readable(value, byLabel[label])}` : item;
    }),
  };
}
