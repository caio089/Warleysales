import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SheetClose } from "./sheet";

describe("Sheet", () => {
  it("mantém o fechamento via primitive e nome acessível português", () => {
    const source = readFileSync(new URL("./sheet.tsx", import.meta.url), "utf8");
    expect(SheetClose).toBeDefined();
    expect(source).toContain("<SheetPrimitive.Close");
    expect(source).toContain('<span className="sr-only">Fechar</span>');
    expect(source).not.toContain('<span className="sr-only">Close</span>');
  });
});
