export function sanitizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    return `${url.origin}${url.pathname}`;
  } catch {
    return raw.replace(/[?#].*$/, '');
  }
}

export function sanitizeText(value: string, sentinels: string[] = []): string {
  let result = value.replace(/(code|token|key|password|cookie|authorization|email)\s*[:=]\s*[^\s&,;]+/gi, '$1=[REDACTED]');
  for (const sentinel of sentinels) if (sentinel) result = result.split(sentinel).join('[REDACTED]');
  return result;
}
