import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('Complete seller registration and login to seller dashboard', async ({ page }) => {
  const seller = {
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '3' + faker.string.numeric(9),
    address: faker.location.streetAddress({ useFullAddress: true }),
    coverageArea: 'Bogotá', 
    specialty: 'Coaching',
    password: 'Prueba4325*',
  };

  await page.goto('/');

  await page.getByRole('link', { name: 'Register as Seller' }).click();

  await page.getByLabel('Full Name *').fill(seller.fullName);
  await page.getByLabel('Email *').fill(seller.email);
  await page.getByLabel('Phone Number *').fill(seller.phone);
  await page.getByLabel('Address *').fill(seller.address);
  await page.getByLabel('Coverage Area *').selectOption({ label: seller.coverageArea });
  await page.getByLabel('Specialty *').fill(seller.specialty);
  await page.getByLabel('Password *', { exact: true }).fill(seller.password);
  await page.getByLabel('Confirm Password *', { exact: true }).fill(seller.password);

  await page.getByRole('button', { name: 'Submit' }).click();

  await page.waitForTimeout(15000);

  await page.getByLabel('Enter your email').fill(seller.email);
  await page.getByLabel('Enter your password').fill(seller.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*seller-dashboard.*/);
});
