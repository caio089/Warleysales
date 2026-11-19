import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

import { NAV_ITEMS } from "@/shared/lib/authz/navigation";
import { SidebarNav } from "./sidebar-nav";

describe("SidebarNav", () => {
  it("deixa links de grupos recolhidos inertes e expostos via disclosure", () => {
    const html = renderToStaticMarkup(<SidebarNav items={NAV_ITEMS} />);
    expect(html).toContain('aria-controls="nav-group-estoque"');
    expect(html).toContain('id="nav-group-estoque" inert=""');
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('id="nav-group-acompanhamento" inert=""');
  });
});
