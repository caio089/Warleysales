import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/dashboard" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

import { NAV_ITEMS } from "@/shared/lib/authz/navigation";
import { SidebarNav } from "./sidebar-nav";

describe("SidebarNav", () => {
  afterEach(() => { route.pathname = "/dashboard"; });

  it("shows Início once and defaults dashboard to first group", () => {
    const html = renderToStaticMarkup(<SidebarNav items={NAV_ITEMS} />);
    expect(html.match(/>Início</gi)).toHaveLength(1);
    expect(html).toMatch(/<a(?=[^>]*href="\/dashboard")(?=[^>]*aria-current="page")[^>]*>[\s\S]*?<span class="truncate">Início<\/span><\/a>/);
    expect(html).not.toContain('aria-expanded="true" aria-controls="nav-group-inicio"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="nav-group-processos"');
    expect(html).toContain('id="nav-group-estoque" inert=""');
    expect(html).toContain('id="nav-group-outras" inert=""');
  });

  it("opens Outras on nested audit route and marks only Auditoria active", () => {
    route.pathname = "/administracao/auditoria";
    const html = renderToStaticMarkup(<SidebarNav items={NAV_ITEMS} />);
    expect(html).toContain('aria-controls="nav-group-outras"');
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain('href="/administracao/auditoria"');
    expect(html).not.toContain('href="/administracao" aria-current="page"');
  });

  it("marks Administração active for nested user administration routes", () => {
    route.pathname = "/administracao/usuarios";
    const html = renderToStaticMarkup(<SidebarNav items={NAV_ITEMS} />);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain('href="/administracao"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toMatch(/href="\/administracao\/auditoria"[^>]*aria-current="page"/);
  });

  it("keeps collapsed Início icon link labeled accessibly", () => {
    const html = renderToStaticMarkup(<SidebarNav items={NAV_ITEMS} collapsed />);
    expect(html).toContain('aria-label="Início"');
    expect(html).not.toContain(">Início</span>");
  });
});
