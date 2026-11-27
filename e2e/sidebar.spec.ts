import { expect, test } from '@playwright/test';

const destinations = [
  ['/dashboard', 'Início', null],
  ['/solicitacoes', 'Solicitações', 'Processos e solicitações'], ['/processos', 'Processos', 'Processos e solicitações'],
  ['/atas', 'Atas', 'Processos e solicitações'], ['/contratos', 'Contratos', 'Processos e solicitações'],
  ['/estoque', 'Consultar estoque', 'Estoque'], ['/entregas', 'Entregas', 'Estoque'],
  ['/calendario', 'Calendário', 'Agenda'], ['/reunioes', 'Reuniões', 'Agenda'],
  ['/conselhos', 'Órgãos e empresas', 'Outras opções'], ['/fornecedores', 'Fornecedores', 'Outras opções'],
  ['/alertas', 'Alertas', 'Outras opções'], ['/relatorios', 'Relatórios', 'Outras opções'],
  ['/administracao/auditoria', 'Auditoria', 'Outras opções'], ['/administracao', 'Administração', 'Outras opções'],
] as const;

test('sidebar disclosures, link inventory, responsive controls, and dashboard render', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dashboard');
  await expect(page.getByText('Fonte de dados não configurada').first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bom dia|Boa tarde|Boa noite/);
  await expect(page.getByText(/Um olhar rápido no dia/)).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Navegação principal' }).first();
  const expectedLinks = destinations.map(([path, name]) => ({ name, href: path }));
  const assertInventory = async () => {
    const actual = await nav.getByRole('link').evaluateAll(anchors => anchors.map(anchor => ({
      name: anchor.textContent?.trim() || anchor.getAttribute('aria-label'),
      href: new URL((anchor as HTMLAnchorElement).href).pathname,
    })));
    expect(actual).toEqual(expectedLinks);
  };
  await expect(nav.getByRole('button')).toHaveText(['Processos e solicitações', 'Estoque', 'Agenda', 'Outras opções']);
  await assertInventory();

  const others = nav.getByRole('button', { name: 'Outras opções' });
  await expect(others).toHaveAttribute('aria-expanded', 'false');
  await others.focus(); await page.keyboard.press('Enter');
  await expect(others).toHaveAttribute('aria-expanded', 'true');
  await assertInventory();
  await page.keyboard.press('Space');
  await expect(others).toHaveAttribute('aria-expanded', 'false');
  await assertInventory();

  for (const [path, name] of destinations.slice(1, 3)) {
    const group = nav.getByRole('button', { name: 'Processos e solicitações' });
    if (await group.getAttribute('aria-expanded') !== 'true') await group.click();
    await nav.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    test.info().annotations.push({ type: 'auth unavailable', description: `Clicking ${path} redirects to /dashboard in isolated no-auth configuration.` });
    await page.goto('/dashboard');
  }

  await page.setViewportSize({ width: 820, height: 1180 });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Início', exact: true })).toBeVisible();
  await expect(nav.getByRole('button')).toHaveText(['Processos e solicitações', 'Estoque', 'Agenda', 'Outras opções']);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
  const dialog = page.getByRole('dialog', { name: 'Navegação' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Início', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Solicitações', exact: true })).toHaveAttribute('href', '/solicitacoes');
  const groupIds = await page.locator("[id$='-processos'], [id$='-estoque'], [id$='-agenda'], [id$='-outras']").evaluateAll(elements => elements.map(element => element.id));
  expect(groupIds).toHaveLength(8);
  expect(new Set(groupIds).size).toBe(groupIds.length);
  const controlsId = await dialog.getByRole('button', { name: 'Processos e solicitações' }).getAttribute('aria-controls');
  expect(controlsId).toBeTruthy();
  await expect(dialog.locator(`#${controlsId}`)).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();

  await page.setViewportSize({ width: 1440, height: 900 });
  const collapse = page.getByRole('button', { name: 'Recolher menu lateral' });
  await collapse.focus(); await page.keyboard.press('Enter');
  const expand = page.getByRole('button', { name: 'Expandir menu lateral' }).first();
  await expect(expand).toBeVisible();
  await expand.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Recolher menu lateral' })).toBeVisible();
});
