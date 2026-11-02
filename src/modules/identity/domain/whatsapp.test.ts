import { describe, expect, it } from "vitest";
import { formatWhatsapp, parseWhatsapp, whatsappHref } from "./whatsapp";

describe("WhatsApp do conselho", () => {
  it("vazio não inventa número", () => {
    expect(parseWhatsapp(null)).toEqual({ ok: true, value: null });
    expect(parseWhatsapp("  ")).toEqual({ ok: true, value: null });
  });
  it("normaliza formatos comuns para E.164", () => {
    expect(parseWhatsapp("(85) 99999-9999")).toEqual({ ok: true, value: "5585999999999" });
    expect(parseWhatsapp("85999999999")).toEqual({ ok: true, value: "5585999999999" });
    expect(parseWhatsapp("+55 85 99999-9999")).toEqual({ ok: true, value: "5585999999999" });
    expect(parseWhatsapp("085 99999-9999")).toEqual({ ok: true, value: "5585999999999" });
  });
  it("rejeita fixo, DDD inválido e tamanho errado", () => {
    expect(parseWhatsapp("8533334444").ok).toBe(false);
    expect(parseWhatsapp("00999999999").ok).toBe(false);
    expect(parseWhatsapp("123").ok).toBe(false);
  });
  it("formata e monta o link wa.me sem inventar dígitos", () => {
    expect(formatWhatsapp("5585999999999")).toBe("+55 (85) 99999-9999");
    expect(whatsappHref("5585999999999")).toBe("https://wa.me/5585999999999");
  });
});
