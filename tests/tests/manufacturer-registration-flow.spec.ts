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
  await page.waitForTimeout(2000);

  await page.getByLabel('Enter your email').fill('admin_27538@example.com');
  await page.getByLabel('Enter your password').fill('Prueba4325*');
  await page.getByRole('button', { name: /Login/i }).click();

  await page.getByText('Authorizations', { exact: false }).click();
  await page.waitForTimeout(2000);

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

  await page.getByRole('button', { name: /Logout/i }).click();

  await page.getByLabel('Enter your email').fill(manufacturer.email);
  await page.getByLabel('Enter your password').fill(manufacturer.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*manufacturer-dashboard.*/);
});

