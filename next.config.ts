import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.WARLEY_E2E === "1" ? "artifacts/e2e-next" : ".next",
  experimental: { agentUpgrade: "security" },
  cacheComponents: true,
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
