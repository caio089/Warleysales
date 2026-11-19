"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export const RETURN_TO_KEY = "returnTo";
const ALLOWED_QUERY_KEY = /^dt-[a-z0-9]+(?:-[a-z0-9]+)*\.(?:q|sort|page|f\.[a-z0-9_-]+)$/;
const LIST_PATHS = ["/solicitacoes", "/processos", "/atas", "/contratos", "/transferencias"] as const;

export function safeReturnTo(value: string | null, expectedPath: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\r\n]/.test(value) || /%0[ad]/i.test(value)) return expectedPath;
  const rawPathname = value.split(/[?#]/, 1)[0];
  if (/[\\\\]/.test(rawPathname) || /%2f|%5c/i.test(rawPathname)) return expectedPath;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || url.pathname !== expectedPath || url.hash) return expectedPath;
    for (const key of url.searchParams.keys()) if (!ALLOWED_QUERY_KEY.test(key)) return expectedPath;
    return `${url.pathname}${url.search}`;
  } catch {
    return expectedPath;
  }
}

export function contextualHref(href: string, pathname: string | null, search: string): string {
  const url = new URL(href, "https://local.invalid");
  if (url.origin !== "https://local.invalid") return href;
  const listPath = LIST_PATHS.find((path) => url.pathname.startsWith(`${path}/`));
  if (!listPath || pathname !== listPath || !search) return href;
  const current = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const returnTo = new URLSearchParams();
  for (const [key, value] of current) if (ALLOWED_QUERY_KEY.test(key)) returnTo.append(key, value);
  if (!returnTo.size) return href;
  url.searchParams.set(RETURN_TO_KEY, `${pathname}?${returnTo.toString()}`);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function ContextualLink({ href, children, ...props }: Omit<LinkProps, "href"> & { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const effectiveHref = contextualHref(href, pathname, searchParams.toString());
  return <Link href={effectiveHref} {...props}>{children}</Link>;
}

export function ReturnLink({ expectedPath, children, ...props }: { expectedPath: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const searchParams = useSearchParams();
  const href = safeReturnTo(searchParams?.get(RETURN_TO_KEY) ?? null, expectedPath);
  return <Link href={href} {...props}>{children}</Link>;
}
