import { describe, expect, it } from "vitest";
import { sanitizeFileName, validateUpload } from "./file-validation";

const bytes = (...values: number[]) => new Uint8Array(values);
const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);

describe("validação de upload (H5)", () => {
  it("aceita PDF válido e calcula SHA-256 do conteúdo", () => {
    const r = validateUpload("termo.PDF", pdf);
    expect(r.ok && r.data.mime).toBe("application/pdf");
    expect(r.ok && r.data.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
  it("hash muda com o conteúdo", () => {
    const a = validateUpload("a.pdf", pdf);
    const b = validateUpload("a.pdf", new Uint8Array([...pdf, 1]));
    expect(a.ok && b.ok && a.data.sha256 !== b.data.sha256).toBe(true);
  });
  it("rejeita extensão proibida mesmo com conteúdo válido", () => {
    expect(validateUpload("virus.exe", pdf).ok).toBe(false);
  });
  it("rejeita conteúdo que não bate com a extensão (magic bytes)", () => {
    expect(validateUpload("falso.pdf", bytes(0x4d, 0x5a, 0x90, 0x00)).ok).toBe(false);
    expect(validateUpload("falso.png", pdf).ok).toBe(false);
  });
  it("aceita ZIP para docx/xlsx e JPEG/PNG", () => {
    expect(validateUpload("a.docx", bytes(0x50, 0x4b, 0x03, 0x04, 0)).ok).toBe(true);
    expect(validateUpload("a.jpg", bytes(0xff, 0xd8, 0xff, 0xe0)).ok).toBe(true);
    expect(validateUpload("a.png", bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)).ok).toBe(true);
  });
  it("rejeita vazio e acima de 25 MB", () => {
    expect(validateUpload("a.pdf", new Uint8Array()).ok).toBe(false);
    const big = new Uint8Array(25 * 1024 * 1024 + 1);
    big.set(pdf);
    expect(validateUpload("a.pdf", big).ok).toBe(false);
  });
  it("sanitiza nomes com caminho e caracteres especiais", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("Relatório final (v2).pdf")).toBe("Relatorio_final_v2_.pdf");
    expect(sanitizeFileName("...")).toBe("arquivo");
  });
});
