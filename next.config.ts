import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.WARLEY_E2E === "1" ? "artifacts/e2e-next" : ".next",
  experimental: {
    agentUpgrade: "security",
    // Keep browser test runs independent from stale Turbopack tasks on disk.
    turbopackFileSystemCacheForDev: process.env.WARLEY_E2E !== "1",
  },
  cacheComponents: true,
  // Parsers OOXML (Excel/Word) ficam fora do bundle do servidor — evitam quebra no extract de solicitações.
  serverExternalPackages: ["mammoth", "xlsx"],
  // Anexos (até 25 MB) vão direto do navegador ao Storage por URL assinada; nenhum corpo grande passa por Server Action.
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
