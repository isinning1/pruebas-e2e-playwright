import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const API_BASE =
  process.env.API_BASE ??
  'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

test.setTimeout(120_000);

test('Complete manufacturer registration, admin approval, and login', async ({ page, request }) => {
  const manufacturer = {
    fullName:    faker.person.fullName(),
    companyName: faker.company.name(),
    address:     faker.location.streetAddress({ useFullAddress: true }),
    email:       faker.internet.email(),
    phone:       '3' + faker.string.numeric(9),
    country:     'Colombia',
    ruc:         faker.string.numeric({ length: 13 }),
    password:    'Prueba4325*',
  };

  await page.goto('/');
  await page.getByRole('link', { name: /register as manufacturer/i }).click();

  await page.getByLabel(/full name of the representative/i).fill(manufacturer.fullName);
  await page.getByLabel(/company name/i).fill(manufacturer.companyName);
  await page.getByLabel(/company address/i).fill(manufacturer.address);
  await page.getByLabel(/^email/i).fill(manufacturer.email);
  await page.getByLabel(/phone number/i).fill(manufacturer.phone);
  await page.getByLabel(/country of operation/i).selectOption(manufacturer.country);
  await page.getByLabel(/tax id|ruc/i).fill(manufacturer.ruc);
  await page.getByLabel(/^password \*/i).fill(manufacturer.password);
  await page.getByLabel(/confirm password \*/i).fill(manufacturer.password);
  await page.getByRole('button', { name: /submit/i }).click();

  await expect(page.locator('.toast-body')).toContainText(/pending validation/i, { timeout: 15000 });

  const adminId   = Math.floor(Math.random() * 100_000);
  const adminMail = `admin_${adminId}@example.com`;
  const adminPass = 'Prueba4325*';

  const res = await request.post(`${API_BASE}/api/create_admin`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      email:            adminMail,
      password:         adminPass,
      confirm_password: adminPass,
      full_name:        `Admin ${adminId}`,
      phone:            `+57-1-${adminId}`,
      department:       'Tecnología',
    }),
  });
  expect(res.status()).toBe(201);

  await page.getByLabel(/enter your email/i).fill(adminMail);
  await page.getByLabel(/enter your password/i).fill(adminPass);
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL(/admin/, { timeout: 20000 });

  const row = page.locator('tbody tr', { hasText: '⚠️' }).filter({ hasText: manufacturer.email }).first();
  await row.getByRole('button', { name: /authorize/i }).click();
  await expect(page.locator('.alert-success')).toBeVisible();

  await page.getByRole('button', { name: /logout/i }).click();
  await page.locator('input[formcontrolname="usuario"]').fill(manufacturer.email);
  await page.locator('input[formcontrolname="contrasena"]').fill(manufacturer.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/manufacturer-dashboard/);
});
