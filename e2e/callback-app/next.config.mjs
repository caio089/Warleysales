import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

const nextConfig = {
  distDir: '../../artifacts/callback-next',
  turbopack: { root: repoRoot },
};

export default nextConfig;
