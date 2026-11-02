/** Mantém apenas dígitos do que a pessoa digitou. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

const MOBILE_E164 = /^55[1-9]\d9\d{8}$/;

export type WhatsappParse = { ok: true; value: string | null } | { ok: false; message: string };

/**
 * Normaliza celular brasileiro para E.164 (`55` + DDD + 9 dígitos).
 * Vazio é válido (o conselho ainda não tem WhatsApp). Número inválido não é gravado.
 */
export function parseWhatsapp(value: string | null | undefined): WhatsappParse {
  if (value == null) return { ok: true, value: null };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };

  let digits = onlyDigits(trimmed);
  if (digits.startsWith("00")) digits = digits.slice(2);
  while (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 11) digits = `55${digits}`;

  if (MOBILE_E164.test(digits)) return { ok: true, value: digits };
  return { ok: false, message: "Informe um celular com DDD, com 9 dígitos. Ex.: (85) 99999-9999." };
}

/** Exibição humana a partir do E.164 gravado. */
export function formatWhatsapp(e164: string): string {
  const match = e164.match(/^55(\d{2})(\d{5})(\d{4})$/);
  if (!match) return e164;
  return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
}

/** Abre a conversa no WhatsApp Web/app; o envio em lote pelo sistema fica para depois. */
export function whatsappHref(e164: string): string {
  return `https://wa.me/${e164}`;
}
