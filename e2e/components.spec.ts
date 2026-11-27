import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const fixture = 'http://127.0.0.1:4319/';
async function openFixture(page: import('@playwright/test').Page, route: string) {
  await page.goto(`${fixture}${route}`);
  await expect(page.locator('[data-fixture-ready]')).toHaveAttribute('data-fixture-ready', 'true', { timeout: 30_000 });
}

test('ProcessView tabs support keyboard, URL, refresh and history on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFixture(page, 'process');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(5);
    const historyTab = page.getByRole('tab', { name: 'Histórico' });
    const runId = process.env.E2E_RUN_ID ?? new Date().toISOString().replace(/[:.]/g, '-');
    await mkdir(`artifacts/evidence/${runId}`, { recursive: true });
    await tabs.nth(0).focus();
    await page.keyboard.press('End');
    await expect(historyTab).toBeFocused();
    await expect(historyTab).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/aba=historico/);
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(0)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toBeFocused();
    await page.screenshot({ path: `artifacts/evidence/${runId}/component-showcase-${viewport.width}x${viewport.height}.png`, fullPage: true });
    await page.reload();
    await expect(page.locator('[data-fixture-ready]')).toHaveAttribute('data-fixture-ready', 'true', { timeout: 30_000 });
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await tabs.nth(1).click();
    await page.goBack();
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await page.goForward();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  }
});

test('DataTable restores namespaced URL state and preserves unrelated query', async ({ page }) => {
  await openFixture(page, 'table?aba=governanca&keep=1#tab');
  const search = page.getByRole('textbox', { name: /buscar em ordens de materiais/i });
  await search.fill('Luvas');
  await expect(page).toHaveURL(/dt-ordens-de-materiais\.q=Luvas/);
  await expect(page).toHaveURL(/aba=governanca/);
  await expect(page).toHaveURL(/keep=1/);
  await expect(page).toHaveURL(/#tab$/);
  await page.reload();
  await expect(page.locator('[data-fixture-ready]')).toHaveAttribute('data-fixture-ready', 'true', { timeout: 30_000 });
  await expect(search).toHaveValue('Luvas');
  await page.goBack();
  await expect(search).toHaveValue('');
  await page.goForward();
  await expect(search).toHaveValue('Luvas');
});

test('ConfirmDialog stays open for false and rejected result, closes on success', async ({ page }) => {
  await openFixture(page, 'confirm');
  await page.getByRole('button', { name: 'Abrir confirmação' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Chamadas do callback')).toHaveText('1');
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByLabel('Resultado confirmação').selectOption('reject');
  await page.getByRole('button', { name: 'Abrir confirmação' }).click();
  const confirm = page.getByRole('button', { name: 'Confirmar' });
  await confirm.click();
  await expect(page.getByRole('alert')).toHaveText('Falha inesperada. Tente novamente.');
  await expect(page.getByLabel('Chamadas do callback')).toHaveText('2');
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole('alertdialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir confirmação' })).toBeFocused();
});

test('FileUpload disables remove while pending and enables it at completion', async ({ page }) => {
  await openFixture(page, 'upload');
  await page.locator('input[type=file]').last().setInputFiles({ name: 'fixture.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 fixture') });
  const remove = page.getByRole('button', { name: 'Remover fixture.pdf da lista' });
  await expect(remove).toBeDisabled();
  await expect(page.getByText('Upload concluído')).toBeVisible();
  await expect(remove).toBeEnabled();
});

test('DataTable search filters only its own table rows', async ({ page }) => {
  await openFixture(page, 'table');
  const search = page.getByRole('textbox', { name: /buscar em ordens de materiais/i });
  await search.fill('Luvas');
  const table = page.getByRole('table', { name: 'Ordens de materiais' });
  await expect(table.getByRole('row').filter({ hasText: 'Luvas' })).toBeVisible();
  await expect(table.getByRole('row').filter({ hasText: 'Resina' })).toHaveCount(0);
});

test('real MaterialOrdersSection search filters synthetic fixture order', async ({ page }) => {
  await openFixture(page, 'table');
  const search = page.getByRole('textbox', { name: 'Buscar pedidos de materiais' });
  await expect(page.getByText('PED-001')).toBeVisible();
  await search.fill('Resina composta');
  await expect(page.getByText('PED-001')).toBeVisible();
  await search.fill('sem correspondência');
  await expect(page.getByText('Nenhum pedido encontrado para a busca')).toBeVisible();
});

test('ContextualLink list state round-trips through real list and detail components', async ({ page }) => {
  const lists = ['solicitacoes', 'processos', 'atas', 'contratos', 'transferencias'];
  for (const kind of lists) {
    await page.goto(`${fixture}${kind}`);
    const isProcess = kind === 'processos';
    const search = isProcess ? page.getByRole('textbox', { name: 'Buscar na tabela' }) : page.getByRole('textbox', { name: /buscar em/i });
    await search.fill('Registro');
    await expect(page).toHaveURL(new RegExp(`dt-${kind}\\.q=Registro`));
    const table = page.getByRole('table');
    const sortable = table.getByRole('button', { name: isProcess ? 'Objeto' : 'Objeto' });
    await sortable.click();
    await expect(page).toHaveURL(new RegExp(`dt-${kind}\\.sort=title%3Aasc`));
    if (!isProcess) {
      await page.getByLabel('Situação').selectOption('pendente');
      await expect(page).toHaveURL(new RegExp(`dt-${kind}\\.f.status=pendente`));
      await page.getByLabel('Situação').selectOption('');
    }
    await table.getByRole('button', { name: 'Objeto' }).click();
    await expect(page).toHaveURL(new RegExp(`dt-${kind}\\.sort=title%3Adesc`));
    await table.getByRole('button', { name: 'Objeto' }).click();
    await expect(page).toHaveURL(new RegExp(`dt-${kind}\\.q=Registro`));
    await page.getByRole('button', { name: 'Próxima' }).click();
    await expect(page).toHaveURL(new RegExp(`dt-${kind}\\.page=2`));
    const detailLink = table.getByRole('link').first();
    const detailUrl = await detailLink.getAttribute('href');
    await detailLink.click();
    await expect(page).toHaveURL(/returnTo=/);
    await expect(page.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', new RegExp(`^/${kind}\\?dt-${kind}`));
    await page.getByRole('link', { name: 'Voltar' }).click();
    await expect(page).toHaveURL(new RegExp(`/${kind}\\?.*dt-${kind}.*page=2`));
    await expect(search).toHaveValue('Registro');
    expect(detailUrl).toContain('returnTo=');
    await page.goto(`${fixture}${kind}/123-2026?returnTo=%2F%2Fevil.invalid`);
    await expect(page.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', `/${kind}`);
  }
});

test('ProcessesTable sort cycles asc desc none and modified click stays on list', async ({ page, context }) => {
  await page.goto(`${fixture}processos`);
  const table = page.getByRole('table', { name: 'Processos administrativos' });
  await expect(table.getByRole('link', { name: '123/2026' })).toHaveAttribute('href', /123-2026/);
  const numberSort = table.getByRole('button', { name: 'Número' });
  await numberSort.click();
  await expect(page).toHaveURL(/dt-processos\.sort=number%3Aasc/);
  await numberSort.click();
  await expect(page).toHaveURL(/dt-processos\.sort=number%3Adesc/);
  await numberSort.click();
  await expect(page).not.toHaveURL(/dt-processos\.sort=/);
  const detail = table.getByRole('link', { name: /123\/2026/ });
  const popupPromise = context.waitForEvent('page');
  await detail.click({ modifiers: ['Control'] });
  const popup = await popupPromise;
  await expect(page).toHaveURL(/\/processos(?:\?|$)/);
  await expect(popup).toHaveURL(/\/processos\/123-2026$/);
  await popup.close();
});

test('ProcessView popstate restores tab for absent and invalid aba values', async ({ page }) => {
  await openFixture(page, 'process');
  const tabs = page.getByRole('tab');
  const defaultTab = page.getByRole('tab', { name: /^Documentação/ });
  await tabs.nth(2).click();
  await page.evaluate(() => history.pushState(null, '', '/process?aba=bad'));
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
  await expect(defaultTab).toHaveAttribute('aria-selected', 'true');
  await page.evaluate(() => history.pushState(null, '', '/process'));
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
  await expect(defaultTab).toHaveAttribute('aria-selected', 'true');
});

test('Sidebar hides collapsed-group links from focus; mobile menu and Sheet close', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4319/shell');
  const stockGroup = page.getByRole('button', { name: 'Estoque' });
  await expect(stockGroup).toHaveAttribute('aria-expanded', 'false');
  await stockGroup.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Outras opções' })).toBeFocused();
  await stockGroup.click();
  await expect(stockGroup).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'Entregas' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  await expect(page.getByRole('heading', { name: 'Navegação' })).toBeVisible();
  await page.getByRole('button', { name: 'Outras opções' }).last().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Alertas' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Navegação' })).toBeHidden();
  await page.goto(`${fixture}sheet`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir painel' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
});
