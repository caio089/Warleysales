/** Como o processo será formalizado na contratação. */
export const PROCESS_CONTRACTING_MODES = [
  {
    value: "registro_precos",
    label: "Sim — registro de preços",
    description: "Terá ata de registro de preços e contrato.",
  },
  {
    value: "contrato",
    label: "Não — só contrato",
    description: "Sem ata; apenas contrato administrativo.",
  },
] as const;

export type ProcessContractingMode = (typeof PROCESS_CONTRACTING_MODES)[number]["value"];

export function isProcessContractingMode(value: unknown): value is ProcessContractingMode {
  return value === "registro_precos" || value === "contrato";
}

export function needsAta(mode: ProcessContractingMode | null | undefined): boolean {
  return mode !== "contrato";
}
