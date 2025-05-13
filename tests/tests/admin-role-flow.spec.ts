import { test, expect } from '@playwright/test';

const adminEmail = 'admin_27538@example.com';
const adminPassword = 'Prueba4325*';

test('Admin logs in and is redirected to admin dashboard', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[formcontrolname="usuario"]', adminEmail);
  await page.fill('input[formcontrolname="contrasena"]', adminPassword);
  await page.click('button[type="submit"]');

  await page.waitForURL(/admin/, { timeout: 10000 });
  await expect(page).toHaveURL(/admin/);
});

test.describe('Admin dashboard actions after login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', adminEmail);
    await page.fill('input[formcontrolname="contrasena"]', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/admin/, { timeout: 15000 });
  });

  test('Authorize a manufacturer user', async ({ page }) => {
    await page.getByText('Authorizations', { exact: false }).click();
    await page.waitForURL(/admin/, { timeout: 5000 });
  
    const warningRow = page.locator('tbody tr').filter({ hasText: '⚠️' }).first();
  
    const email = await warningRow.locator('td').nth(1).innerText();
  
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(email);
  
    const filteredRow = page.locator('tbody tr').first();
    await expect(filteredRow).toContainText(email);
  
    const authorizeButton = filteredRow.locator('button.btn-success');
    await expect(authorizeButton).toBeVisible();
    await authorizeButton.click();
  
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('Search and filter products in warehouse', async ({ page }) => {
    await page.getByText('Products', { exact: false }).click();
    await page.waitForURL(/warehouse/);

    await expect(page.locator('h2')).toContainText(/hello admin/i, { timeout: 5000 });

    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(1);

    let firstProduct = '';
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
      const cells = await page.locator('tbody tr td').allInnerTexts();
      firstProduct = cells.find(text => text.trim() !== '') || '';
      if (firstProduct) break;
      await page.waitForTimeout(500);
    }
    expect(firstProduct).not.toBe('');

    await page.fill('input[placeholder*="Search"]', firstProduct);

    await expect(page.locator('tbody tr').filter({ hasText: firstProduct })).toBeVisible();


    await page.selectOption('select#countryFilter', { label: 'Colombia' });
    await page.selectOption('select#warehouseFilter', { index: 1 });
  });

  test('Admin navigates to performance dashboard and selects a seller from list', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/hello admin/i, { timeout: 5000 });
  
    await page.getByText('Performance', { exact: false }).click();
    await page.waitForURL(/performance-dashboard/, { timeout: 10000 });
    await expect(page.locator('h2')).toContainText(/performance/i);
  
    await page.waitForTimeout(10000);
  
    const input = page.locator('input#sellerSearch');
    await input.click();
  
    const validOption = page.locator('ul#seller-options li:not(.disabled)').first();
    await expect(validOption).toBeVisible({ timeout: 10000 });
  
    await validOption.dispatchEvent('mousedown');
  
    await expect(page.locator('strong')).toContainText(/showing results for/i, { timeout: 5000 });
    await expect(page.locator('table')).toBeVisible();
  });

  test('Admin logout from navbar', async ({ page }) => {
    const logoutBtn = page.locator('button[title="Logout"]');
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/\?logout=true$/);
  
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
