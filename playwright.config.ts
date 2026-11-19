import { readFileSync, existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const sensitiveName = /(?:API_KEY|TOKEN|SECRET|PASSWORD|DATABASE|SUPABASE|GROQ|RESEND|SMTP)/i;
const envFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];
const envNames = new Set<string>();
for (const file of envFiles) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) envNames.add(match[1]);
  }
}
const isolatedEnv: Record<string, string> = { ...process.env } as Record<string, string>;
for (const name of Object.keys(isolatedEnv)) if (sensitiveName.test(name)) isolatedEnv[name] = '';
for (const name of envNames) isolatedEnv[name] = '';
Object.assign(isolatedEnv, {
  PORT: '4317', WARLEY_E2E: '1', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '',
  GROQ_API_KEY: '', RESEND_API_KEY: '', SMTP_HOST: '', SMTP_USER: '', SMTP_PASSWORD: '',
});

export default defineConfig({
  testDir: './e2e', workers: 1, timeout: 60000, outputDir: 'artifacts/test-results',
  reporter: [['list'], ['html', { outputFolder: 'artifacts/html', open: 'never' }], ['json', { outputFile: 'artifacts/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4317', browserName: 'chromium', channel: 'msedge', trace: 'retain-on-failure', screenshot: 'off', serviceWorkers: 'block' },
  projects: [{ name: 'msedge', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'npm run dev -- --hostname 127.0.0.1 --port 4317', url: 'http://127.0.0.1:4317', reuseExistingServer: false, env: isolatedEnv },
    {
      command: 'node e2e/callback-server.mjs', port: 4319, reuseExistingServer: false,
      env: {
        ...isolatedEnv, PORT: '4319', NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:4320',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'synthetic-callback-publishable-key',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '',
      },
    },
  ],
});
