import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { sanitizeText, sanitizeUrl } from './sanitize';

const allowedOrigin = 'http://127.0.0.1:4317';
const routes = ['/administracao', '/alertas', '/atas', '/calendario', '/conselhos', '/contratos', '/dashboard', '/entregas', '/estoque', '/fornecedores', '/meu-conselho', '/processos', '/relatorios', '/reunioes', '/solicitacoes', '/transferencias'];
const run = process.env.E2E_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
const root = `artifacts/evidence/${run}`;
const evidence = new WeakMap<Page, { events: string[]; browser: string; blocked: number }>();

test.beforeEach(async ({ page, browser }) => {
  await mkdir(root, { recursive: true });
  const state = { events: [] as string[], browser: browser.version(), blocked: 0 };
  evidence.set(page, state);
  await page.context().route('**/*', async route => {
    const url = route.request().url();
    let origin = '';
    try { origin = new URL(url).origin; } catch { /* local non-network scheme */ }
    if (origin && origin !== allowedOrigin) {
      state.blocked++;
      state.events.push(`blocked ${route.request().method()} ${sanitizeUrl(url)}`);
      await route.abort('blockedbyclient');
    } else await route.continue();
  });
  page.on('console', message => state.events.push(`console ${message.type()}: ${sanitizeText(message.text())}`));
  page.on('pageerror', error => state.events.push(`pageerror: ${sanitizeText(error.message)}`));
  page.on('request', request => state.events.push(`request ${request.method()} ${sanitizeUrl(request.url())}`));
  page.on('requestfailed', request => state.events.push(`requestfailed ${request.method()} ${sanitizeUrl(request.url())} ${sanitizeText(request.failure()?.errorText ?? '')}`));
  page.on('response', response => { if (response.status() >= 400) state.events.push(`response ${response.status()} ${sanitizeUrl(response.url())}`); });
});

test.afterEach(async ({ page }, info: TestInfo) => {
  const state = evidence.get(page)!;
  const dir = `${root}/${info.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  await mkdir(dir, { recursive: true });
  state.events.push(`browser.version ${state.browser}`, `final.url ${sanitizeUrl(page.url())}`, `external blocked ${state.blocked}`);
  try {
    await writeFile(`${dir}/dom.aria.txt`, sanitizeText(await page.locator('body').ariaSnapshot({ timeout: 3000 })));
    await writeFile(`${dir}/dom.html`, sanitizeText(await page.locator('body').innerHTML({ timeout: 3000 })));
    await page.screenshot({ path: `${dir}/final.png`, fullPage: true, timeout: 5000 });
  } catch (error) { state.events.push(`artifact capture failed: ${sanitizeText(String(error))}`); }
  await writeFile(`${dir}/console-network.txt`, state.events.join('\n'));
  await writeFile(`${dir}/browser.txt`, `browser.version ${state.browser}\nfinal.url ${sanitizeUrl(page.url())}`);
  await info.attach('console-network', { path: `${dir}/console-network.txt`, contentType: 'text/plain' });
  for (const [name, path, type] of [['aria-dom', `${dir}/dom.aria.txt`, 'text/plain'], ['screenshot', `${dir}/final.png`, 'image/png']] as const) await info.attach(name, { path, contentType: type }).catch(() => {});
  if (state.blocked && info.title !== 'network barrier self-check') throw new Error(`${state.blocked} external request(s) blocked; see ${dir}/console-network.txt`);
});

test('sanitization self-check redacts sensitive text and URL data', () => {
  expect(sanitizeUrl('http://localhost/private?token=abc123#code=xyz789')).toBe('http://localhost/private');
  const sanitized = sanitizeText('token=abc123 code=xyz789');
  expect(sanitized).toContain('token=[REDACTED]');
  expect(sanitized).toContain('code=[REDACTED]');
  expect(sanitized).not.toContain('abc123');
  expect(sanitized).not.toContain('xyz789');
});

test('network barrier self-check', async ({ page }) => {
  const state = evidence.get(page)!;
  await page.goto('http://localhost:4318/barrier-check').catch(() => {});
  expect(state.blocked).toBe(1);
  await expect.poll(() => state.events.filter(event => event.startsWith('requestfailed GET http://localhost:4318/barrier-check')).length).toBe(1);
  expect(state.events.some(event => event.startsWith('blocked GET http://localhost:4318/barrier-check'))).toBe(true);
});

test('envio local sem backend apresenta indisponibilidade', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  const email = page.getByRole('textbox', { name: 'E-mail' });
  const password = page.getByRole('textbox', { name: 'Senha' });
  await email.fill('sintetico@example.invalid'); await password.fill('senha-sintetica');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha' }).click();
  const loginPost = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === '/login');
  await page.getByRole('button', { name: 'Acessar o portal' }).click();
  const loginResponse = await loginPost;
  expect(loginResponse.status()).toBe(200);
  await expect(page.getByRole('alert').filter({ hasText: 'Autenticação não configurada neste ambiente.' }).first()).toBeVisible();
  await expect(email).toHaveValue('sintetico@example.invalid'); await expect(password).toHaveValue('senha-sintetica');
  await page.getByRole('link', { name: 'Esqueci minha senha' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/recuperar-senha/);
  const recoveryEmail = page.getByRole('textbox', { name: 'E-mail' });
  await recoveryEmail.fill('sintetico@example.invalid');
  const recoveryPost = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname === '/recuperar-senha');
  await page.getByRole('button', { name: 'Enviar instruções' }).click();
  expect((await recoveryPost).status()).toBe(200);
  await expect(page.getByRole('alert').filter({ hasText: 'Autenticação não configurada neste ambiente.' }).first()).toBeVisible();
  await expect(recoveryEmail).toHaveValue('sintetico@example.invalid');
  await page.goto('/redefinir-senha');
  await expect(page.getByRole('textbox', { name: 'Nova senha' })).toBeVisible();
});

test('short/mismatch password validation blocked without auth configuration', async () => {
  test.skip(true, 'Validação de senha curta e divergente requer auth configurada; backend isolado retorna indisponibilidade.');
});

test('public routes show unconfigured state; legacy route redirects to dashboard', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'load', timeout: 60000 }); expect(response?.status(), route).toBeLessThan(500);
    await expect(page).toHaveURL(route === '/meu-conselho' ? /\/dashboard$/ : new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.getByText('Fonte de dados não configurada').first(), route).toBeVisible({ timeout: 30000 });
  }
});

test('search is blocked because shell exposes no search control', async () => {
  test.skip(true, 'Busca não encontrada neste shell; não há controle a exercitar.');
});

test('desktop e mobile navigation and viewports', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/dashboard');
    await expect(page.getByText('Fonte de dados não configurada').first()).toBeVisible();
    expect(await page.locator('body').evaluate(element => element.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: `${root}/structure-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/dashboard');
  const collapse = page.getByRole('button', { name: 'Recolher menu lateral' });
  await expect(collapse).toHaveAttribute('aria-expanded', 'true'); await collapse.click();
  const expand = page.getByRole('button', { name: 'Expandir menu lateral' }).first(); await expect(expand).toBeVisible(); await expand.click({ force: true });
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  const dialog = page.getByRole('dialog', { name: 'Navegação' }); await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: 'Solicitações' }).click();
  await expect(page).toHaveURL(/\/solicitacoes$/); await expect(dialog).toBeHidden();

});

test('callback without code redirects to login', async ({ request }) => {
  const response = await request.get(`${allowedOrigin}/auth/callback`, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe('http://localhost:4317/login');
});

test('auth pages render at mobile viewport before interaction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1440 });
  for (const [path, heading, control] of [
    ['/login', 'Bem-vindo de volta', 'E-mail'],
    ['/recuperar-senha', 'Recuperar senha', 'E-mail'],
    ['/redefinir-senha', 'Definir senha', 'Nova senha'],
  ]) {
    const name = path.slice(1);
    await page.goto(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.getByRole('textbox', { name: control })).toBeVisible();
    await page.screenshot({ path: `${root}/auth-${name}-390x1440.png`, fullPage: true });
  }
});
