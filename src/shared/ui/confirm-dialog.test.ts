import { describe, expect, it } from "vitest";
import { confirmationSucceeded } from "./confirm-dialog";

describe("confirmationSucceeded", () => {
  it("fecha somente quando callback não retorna false", () => {
    expect(confirmationSucceeded(false)).toBe(false);
    expect(confirmationSucceeded(true)).toBe(true);
    expect(confirmationSucceeded(undefined)).toBe(true);
  });
});
