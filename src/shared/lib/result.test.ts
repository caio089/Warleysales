import { describe, expect, it } from "vitest";
import { fail, ok } from "./result";

describe("Result", () => {
  it("ok carrega os dados", () => {
    expect(ok(5)).toEqual({ ok: true, data: 5 });
  });

  it("fail carrega código, mensagem e erros por campo", () => {
    const r = fail("VALIDATION", "Dados inválidos", { title: ["Obrigatório"] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors?.title).toEqual(["Obrigatório"]);
  });
});
