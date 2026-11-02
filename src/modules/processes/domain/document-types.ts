/**
 * Os 7 tipos documentais exigidos por processo (R1).
 * Nomenclatura provisória (pendência P6): editável em configurações quando confirmada.
 * O código é estável e usado como chave; o rótulo é apenas exibição.
 */
export const DOCUMENT_TYPES = [
  { code: "DFD", label: "Documento de Formalização da Demanda" },
  { code: "ETP", label: "Estudo Técnico Preliminar" },
  { code: "MR", label: "Matriz de Riscos" },
  { code: "TR", label: "Termo de Referência" },
  { code: "PP", label: "Pesquisa de Preços" },
  { code: "PJ", label: "Parecer Jurídico" },
  { code: "ED", label: "Edital" },
] as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPES)[number]["code"];

export const REQUIRED_DOCUMENT_COUNT = DOCUMENT_TYPES.length;
export const DOCUMENT_TYPE_CODES: readonly DocumentTypeCode[] = DOCUMENT_TYPES.map((t) => t.code);
