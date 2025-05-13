import { test, expect } from '@playwright/test';

test.describe('Login by user role', () => {
  test('Manufacturer logs in and is redirected to manufacturer-dashboard', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', 'Delaney_Brekke1@hotmail.com');
    await page.fill('input[formcontrolname="contrasena"]', 'Prueba4325*');
    await page.click('button[type="submit"]');

    await page.waitForURL(/manufacturer-dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/manufacturer-dashboard/);
  });

  test('Seller logs in and is redirected to seller-dashboard', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', 'seller_528@example.com'); 
    await page.fill('input[formcontrolname="contrasena"]', 'Prueba4325*');
    await page.click('button[type="submit"]');

    await page.waitForURL(/seller-dashboard/, { timeout: 20000 });
    await expect(page).toHaveURL(/seller-dashboard/);
  });

  test('Admin logs in and is redirected to admin dashboard', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', 'admin_27538@example.com');
    await page.fill('input[formcontrolname="contrasena"]', 'Prueba4325*');
    await page.click('button[type="submit"]');

    await page.waitForURL(/admin/, { timeout: 10000 });
    await expect(page).toHaveURL(/admin/);
  });
});