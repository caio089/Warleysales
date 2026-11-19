import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog trigger", () => {
  it("usa elemento trigger com role, nome e tipo próprios", () => {
    const html = renderToStaticMarkup(
      <ConfirmDialog
        trigger={<Button type="button">Remover documento</Button>}
        title="Remover"
        description="Confirma?"
        onConfirm={() => undefined}
      />,
    );

    expect(html).toContain('<button type="button"');
    expect(html).toContain("Remover documento");
    expect(html).not.toContain("<span class=\"inline-flex\">");
    expect(html).not.toContain("<button><button");
  });
});
