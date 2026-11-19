import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { writeTableUrlState } from "./data-table-logic";

vi.mock("next/navigation", () => ({ usePathname: () => null, useSearchParams: () => new URLSearchParams() }));

import { ContextualLink, contextualHref, safeReturnTo } from "./contextual-link";

describe("contextual link return boundary", () => {
  it("round trips real DataTable URL state", () => {
    const tableParams = writeTableUrlState(new URLSearchParams(), "dt-atas", {
      search: "compras", sortKey: "number", sortDirection: "desc", filters: { status: "vigente" }, page: 3,
    });
    const detailHref = contextualHref("/atas/42", "/atas", `?${tableParams.toString()}`);
    const returnTo = new URL(detailHref, "https://local.invalid").searchParams.get("returnTo");
    expect(safeReturnTo(returnTo, "/atas")).toBe(`/atas?${tableParams.toString()}`);
  });

  it("round trips search values with encoded slash and literal backslash", () => {
    for (const search of ["123/2026", "abc\\\\def"]) {
      const params = writeTableUrlState(new URLSearchParams(), "dt-atas", {
        search, sortKey: "number", sortDirection: "asc", filters: {}, page: 1,
      });
      const href = contextualHref("/atas/42", "/atas", `?${params.toString()}`);
      const returnTo = new URL(href, "https://local.invalid").searchParams.get("returnTo");
      expect(safeReturnTo(returnTo, "/atas")).toBe(`/atas?${params.toString()}`);
    }
  });

  it("preserves existing query and hash, replaces duplicate returnTo", () => {
    const href = contextualHref("/atas/42?tab=history&returnTo=bad#events", "/atas", "?dt-atas.page=2");
    const url = new URL(href, "https://local.invalid");
    expect(url.searchParams.get("tab")).toBe("history");
    expect(url.searchParams.getAll("returnTo")).toEqual(["/atas?dt-atas.page=2"]);
    expect(url.hash).toBe("#events");
  });

  it("uses canonical fallback for unsafe and non-DataTable keys", () => {
    for (const value of [null, "//evil.example/atas", "https://evil.example/atas", "/contratos?dt-atas.page=2", "/atas/%2f%2fevil", "/atas?dt-atas.page=2%0d%0aX:bad", "/atas?orgao=7", "/atas?dt-atas.unknown=x", "/atas#fragment"]) {
      expect(safeReturnTo(value, "/atas")).toBe("/atas");
    }
  });

  it("renders canonical href during server rendering", () => {
    expect(renderToStaticMarkup(<ContextualLink href="/atas/42">Open</ContextualLink>)).toContain('href="/atas/42"');
  });
});
