import { describe, expect, it } from "vitest";
import { deadlinePriority } from "./deadline-priority";

describe("deadlinePriority", () => {
  it.each([
    [-1, ""], [0, "Alta"], [30, "Alta"], [31, "Média"],
    [60, "Média"], [61, "Baixa"], [90, "Baixa"], [91, ""],
  ] as const)("classifica %i dias como %s", (days, expected) => {
    expect(deadlinePriority(days)).toBe(expected);
  });
});
