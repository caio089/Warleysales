import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Upload de anexos (até 25 MB) via Server Action. Em produção na Vercel o limite do payload da função
  // é menor; ver docs/ (pendências) sobre migrar para URL assinada direta ao Storage.
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
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
