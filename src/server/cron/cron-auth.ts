import { timingSafeEqual } from "node:crypto";

/** Valida `Authorization: Bearer <CRON_SECRET>` com comparação em tempo constante. Sem segredo configurado, nega tudo. */
export function isCronAuthorized(authorizationHeader: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !authorizationHeader) return false;
  const prefix = "Bearer ";
  if (!authorizationHeader.startsWith(prefix)) return false;
  const provided = Buffer.from(authorizationHeader.slice(prefix.length));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
