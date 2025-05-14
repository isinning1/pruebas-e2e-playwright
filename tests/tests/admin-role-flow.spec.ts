import { test as base, expect } from '@playwright/test';

const API_BASE =
  process.env.API_BASE ??
  'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod/api';

type Admin = { id: string; email: string; password: string };

const test = base.extend<{ admin: Admin }>({
  admin: [
    async ({ request }, use) => {
      const randomId = Math.floor(Math.random() * 100_000);
      const email = `admin_${randomId}@example.com`;
      const password = 'Prueba4325*';
      const response = await request.post(`${API_BASE}/create_admin`, {
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
          email,
          password,
          confirm_password: password,
          full_name: `nombre ${randomId}`,
          phone: `+1-800-${randomId}`,
          department: 'Tecnología',
        }),
      });
      expect(response.status()).toBe(201);
      const { id } = await response.json();
      await use({ id, email, password });
      await request.delete(`${API_BASE}/id_admin/${id}`).catch(() => {});
    },
    { scope: 'test' },
  ],
});

test.setTimeout(120_000);

test.describe('Admin E2E dinámico', () => {
  test.beforeEach(async ({ page, admin }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.fill('input[formcontrolname="usuario"]', admin.email);
    await page.fill('input[formcontrolname="contrasena"]', admin.password);
    await page.click('button[type="submit"]');
    await expect(page.locator('h2')).toContainText(/hello admin/i, { timeout: 20000 });
  });

  test('Authorize a manufacturer user', async ({ page }) => {
    await page.getByText(/Authorizations/i).click();
    await page.waitForURL(/admin/);
    const warningRow = page.locator('tbody tr').filter({ hasText: '⚠️' }).first();
    const email = await warningRow.locator('td').nth(1).innerText();
    await page.locator('input[placeholder*="Search"]').fill(email);
    const filtered = page.locator('tbody tr').first();
    await expect(filtered).toContainText(email);
    await filtered.locator('button.btn-success').click();
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('Search and filter products in warehouse', async ({ page }) => {
    await page.getByText(/Products/i).click();
    await page.waitForURL(/warehouse/);
    await expect(page.locator('h2')).toContainText(/hello admin/i, { timeout: 5000 });
    expect(await page.locator('tbody tr').count()).toBeGreaterThan(1);
    let product = '';
    for (let i = 0; i < 10; i++) {
      const cells = await page.locator('tbody tr td').allInnerTexts();
      product = cells.find(t => t.trim()) ?? '';
      if (product) break;
      await page.waitForTimeout(500);
    }
    expect(product).not.toBe('');
    await page.fill('input[placeholder*="Search"]', product);
    await expect(page.locator('tbody tr').filter({ hasText: product })).toBeVisible();
    await page.selectOption('select#countryFilter', { label: 'Colombia' });
    await page.selectOption('select#warehouseFilter', { index: 1 });
  });

    test('Navigate to performance dashboard and pick a seller', async ({ page }) => {
    await page.getByText(/Performance/i).click();
    await page.waitForURL(/performance-dashboard/, { timeout: 10000 });
    await expect(page.locator('h2')).toContainText(/performance/i);

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: 60000 });

    await firstRow.click();                          

    await expect(page.locator('table')).toBeVisible(); 
    });

  test('Admin logout from navbar', async ({ page }) => {
    await page.locator('button[title="Logout"]').click();
    await expect(page).toHaveURL(/\\?logout=true$/);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
