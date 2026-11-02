import { createHash } from "node:crypto";
import { ALLOWED_FILE_TYPES, MAX_UPLOAD_BYTES, extensionOf } from "@/shared/lib/upload-rules";
import { fail, ok, type Result } from "@/shared/lib/result";

/** Assinaturas (magic bytes) por extensão — H5: não confiamos em MIME/extensão informados pelo cliente. */
const SIGNATURES: Record<string, readonly (readonly number[])[]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]], // %PDF-
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  docx: [[0x50, 0x4b, 0x03, 0x04]], // ZIP (OOXML)
  xlsx: [[0x50, 0x4b, 0x03, 0x04]],
};

export interface ValidatedFile {
  extension: string;
  mime: string;
  size: number;
  sha256: string;
}

const startsWith = (bytes: Uint8Array, signature: readonly number[]) =>
  signature.every((value, index) => bytes[index] === value);

/** Sanitiza o nome para uso em caminho de storage (remove diretórios e caracteres perigosos). */
export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "arquivo";
  const cleaned = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_");
  return cleaned.replace(/^\.+/, "").slice(0, 120) || "arquivo";
}

/** Valida extensão, tamanho e assinatura; calcula SHA-256 do conteúdo real. */
export function validateUpload(fileName: string, bytes: Uint8Array): Result<ValidatedFile> {
  const extension = extensionOf(fileName);
  const mime = ALLOWED_FILE_TYPES[extension];
  if (!mime) return fail("VALIDATION", "Tipo de arquivo não permitido.", { file: ["Extensão não permitida."] });
  if (bytes.byteLength === 0) return fail("VALIDATION", "O arquivo está vazio.", { file: ["Arquivo vazio."] });
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return fail("VALIDATION", "O arquivo excede o limite de 25 MB.", { file: ["Arquivo muito grande."] });
  }
  const signatures = SIGNATURES[extension] ?? [];
  if (!signatures.some((signature) => startsWith(bytes, signature))) {
    return fail("VALIDATION", "O conteúdo do arquivo não corresponde à extensão informada.", {
      file: ["Conteúdo inconsistente com a extensão."],
    });
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return ok({ extension, mime, size: bytes.byteLength, sha256 });
}
