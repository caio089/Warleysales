/**
 * Regras de upload compartilhadas entre cliente (pré-validação de UX) e servidor
 * (validação definitiva em DocumentService, com magic bytes e SHA-256 — H5).
 */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

/** Extensão permitida -> MIME canônico. */
export const ALLOWED_FILE_TYPES: Readonly<Record<string, string>> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const ALLOWED_EXTENSIONS_LABEL = Object.keys(ALLOWED_FILE_TYPES)
  .map((e) => e.toUpperCase())
  .join(", ");

export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
}

/** Pré-validação por metadados (nome/tamanho). Retorna mensagem de erro ou null. */
export function validateFileMeta(fileName: string, size: number): string | null {
  if (!(extensionOf(fileName) in ALLOWED_FILE_TYPES)) {
    return `Tipo não permitido. Use: ${ALLOWED_EXTENSIONS_LABEL}.`;
  }
  if (size <= 0) return "O arquivo está vazio.";
  if (size > MAX_UPLOAD_BYTES) return "O arquivo excede o limite de 25 MB.";
  return null;
}
