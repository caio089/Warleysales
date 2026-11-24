import { expect, test } from "@playwright/test";

test("entrada de reais mantém posição, centavos e valor numérico no formulário", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:4319" });
  await page.goto("http://127.0.0.1:4319/currency");
  await expect(page.locator("[data-fixture-ready]")).toHaveAttribute("data-fixture-ready", "true", { timeout: 30_000 });

  const input = page.getByRole("textbox", { name: "Valor", exact: true });
  const submitted = () => page.locator("form").evaluate((form) => Object.fromEntries(new FormData(form as HTMLFormElement)));
  for (const [typed, display, canonical] of [
    ["100", "100", "100"],
    ["1000", "1.000", "1000"],
    ["10000", "10.000", "10000"],
    ["150000", "150.000", "150000"],
    ["1250000", "1.250.000", "1250000"],
    ["10000,50", "10.000,50", "10000.50"],
    ["0,99", "0,99", "0.99"],
    ["0", "0", "0"],
  ]) {
    await input.fill("");
    await input.pressSequentially(typed);
    await expect(input).toHaveValue(display);
    expect((await submitted()).value).toBe(canonical);
  }
  await input.fill("");
  await input.pressSequentially("10000,");
  await expect(input).toHaveValue("10.000,");
  await input.pressSequentially("50");
  await input.press("Backspace");
  await expect(input).toHaveValue("10.000,5");
  await input.fill("");
  await input.pressSequentially("12.50");
  await expect(input).toHaveValue("12,50");

  const existing = page.getByRole("textbox", { name: "Valor existente" });
  await expect(existing).toHaveValue("10.500,5");
  await existing.focus();
  await existing.evaluate((node) => (node as HTMLInputElement).setSelectionRange(4, 4));
  await existing.pressSequentially("2");
  await expect(existing).toHaveValue("105.200,5");
  await expect(existing).toBeFocused();
  expect(await existing.evaluate((node) => (node as HTMLInputElement).selectionStart)).toBe(5);

  for (const [text, expected] of [["10000", "10000"], ["10.000,50", "10000.50"], ["R$ 10.000,50", "10000.50"]]) {
    await page.evaluate((value) => navigator.clipboard.writeText(value), text);
    await input.press("Control+a");
    await input.press("Control+v");
    await expect.poll(async () => (await submitted()).value).toBe(expected);
  }
  await input.press("Control+a");
  await input.press("Backspace");
  expect((await submitted()).value).toBe("");
  await input.pressSequentially("-10");
  expect(await input.evaluate((node) => (node as HTMLInputElement).validity.patternMismatch)).toBe(true);
  await expect(page.getByRole("textbox", { name: "Somente leitura" })).toHaveValue("0,99");
  expect((await submitted()).readOnly).toBe("0.99");
  expect((await submitted()).disabled).toBeUndefined();
  await page.getByRole("button", { name: "Restaurar" }).click();
  await expect(input).toHaveValue("");
  await expect(existing).toHaveValue("10.500,5");
  await page.getByRole("button", { name: "Valor persistido" }).click();
  const cells = page.getByRole("table", { name: "Valores persistidos" }).getByRole("cell");
  await expect(cells).toHaveText([/R\$\s+99,00/, /R\$\s+1\.000,00/, /R\$\s+10\.000,50/, "—"]);
});
