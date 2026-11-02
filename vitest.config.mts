import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias "@" espelha o paths do tsconfig para os testes.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["src/**/*.test.{ts,tsx}"] },
});
