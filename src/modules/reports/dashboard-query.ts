import { z } from "zod";

export const DASHBOARD_FOCUS = ["todos", "atencao", "documentos", "prazos"] as const;
export type DashboardFocus = (typeof DASHBOARD_FOCUS)[number];

const uuid = z.uuid();
const focusSchema = z.enum(DASHBOARD_FOCUS);

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Interpreta a query do dashboard. Valores inválidos são ignorados (nunca quebram a tela). */
export function parseDashboardQuery(raw: {
  councilId?: string | string[];
  focus?: string | string[];
}): { councilId?: string; focus: DashboardFocus } {
  const councilRaw = first(raw.councilId);
  const focusRaw = first(raw.focus);
  return {
    councilId: councilRaw && uuid.safeParse(councilRaw).success ? councilRaw : undefined,
    focus: focusSchema.safeParse(focusRaw).success ? (focusRaw as DashboardFocus) : "todos",
  };
}
