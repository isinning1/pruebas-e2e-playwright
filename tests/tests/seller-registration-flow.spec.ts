// tests/seller-registration-flow.spec.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.setTimeout(120_000);

test('Complete seller registration and login to seller dashboard', async ({ page }) => {
  const seller = {
    fullName:  faker.person.fullName(),
    email:     faker.internet.email(),
    phone:     '3' + faker.string.numeric(9),
    address:   faker.location.streetAddress({ useFullAddress: true }),
    coverage:  'Bogotá',
    specialty: 'Coaching',
    password:  'Prueba4325*',
  };

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /register as seller/i }).click();

  await page.getByLabel(/^full name/i).fill(seller.fullName);
  await page.getByLabel(/^email/i).fill(seller.email);
  await page.getByLabel(/^phone number/i).fill(seller.phone);
  await page.getByLabel(/^address/i).fill(seller.address);
  await page.getByLabel(/coverage area/i).selectOption({ label: seller.coverage });
  await page.getByLabel(/specialty/i).fill(seller.specialty);
  await page.getByLabel(/^password \*/i).fill(seller.password);
  await page.getByLabel(/confirm password \*/i).fill(seller.password);

  await Promise.all([
    page.getByRole('button', { name: /submit/i }).click(),
    page.getByRole('heading', { name: /login/i }).waitFor({ state: 'visible', timeout: 30_000 }),
  ]);

  await page.getByLabel(/enter your email/i).fill(seller.email);
  await page.getByLabel(/enter your password/i).fill(seller.password);

  await Promise.all([
    page.getByRole('button', { name: /login/i }).click(),
    page.waitForURL(/seller-dashboard/, { timeout: 30_000 }),
  ]);

  await expect(page).toHaveURL(/seller-dashboard/);
});
