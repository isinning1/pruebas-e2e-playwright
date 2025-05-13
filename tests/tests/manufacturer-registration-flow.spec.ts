import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('Complete manufacturer registration, admin approval, and login', async ({ page }) => {
  const manufacturer = {
    fullName: faker.person.fullName(),
    companyName: faker.company.name(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    email: faker.internet.email(),
    phone: '3' + faker.string.numeric(9),
    country: 'Colombia',
    ruc: faker.string.numeric({ length: 13 }),
    password: 'Prueba4325*',
  };

  await page.goto('/');

  await page.getByRole('link', { name: 'Register as Manufacturer' }).click();

  await page.getByLabel('Full name of the representative').fill(manufacturer.fullName);
  await page.getByLabel('Company name').fill(manufacturer.companyName);
  await page.getByLabel('Company address').fill(manufacturer.address);
  await page.getByLabel('Email').fill(manufacturer.email);
  await page.getByLabel('Phone number').fill(manufacturer.phone);
  await page.getByLabel('Country of operation').selectOption(manufacturer.country);
  await page.getByLabel('Tax ID or RUC').fill(manufacturer.ruc);
  await page.getByLabel('Password *', { exact: true }).fill(manufacturer.password);
  await page.getByLabel('Confirm password *', { exact: true }).fill(manufacturer.password);

  await page.getByRole('button', { name: /Submit/i }).click();
  await page.waitForTimeout(13000);
  await expect(page.locator('.toast-body')).toContainText('Please wait for approval');
  await page.waitForTimeout(5000);

  await page.getByLabel('Enter your email').fill('admin_74806@example.com');
  await page.getByLabel('Enter your password').fill('Prueba4325*');
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('admin', { timeout: 50000 });
  await expect(page.locator('h4')).toHaveText(/search users/i);

  const warningRow = page.locator('tbody tr', { hasText: '⚠️' }).filter({ hasText: manufacturer.email }).first();
  await expect(warningRow).toContainText(manufacturer.email, { timeout: 20000 });
  await warningRow.getByRole('button', { name: /authorize/i }).click();
  await expect(page.locator('.alert-success')).toBeVisible();

  await page.getByRole('button', { name: /logout/i }).click();

  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  await page.locator('input[formcontrolname="usuario"]').fill(manufacturer.email);
  await page.locator('input[formcontrolname="contrasena"]').fill(manufacturer.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('**/manufacturer-dashboard');
});

