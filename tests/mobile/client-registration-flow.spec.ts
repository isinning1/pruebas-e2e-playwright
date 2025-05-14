// tests/mobile/client-registration-flow.spec.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.setTimeout(120_000);

test('Client: register, login y llegar a /home-client', async ({ page }) => {
  const client = {
    fullName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: '3125865258',
    address: faker.location.streetAddress({ useFullAddress: true }),
    password: 'Prueba4325*',
    confirmPassword: 'Prueba4325*',
  };

  await page.goto('/', { waitUntil: 'networkidle' });

  const registerButton = page.locator('app-login ion-button[fill="outline"][color="primary"][ng-reflect-router-link="/register"]');
  await expect(registerButton).toBeVisible({ timeout: 10_000 });
  await registerButton.click();

  await page.waitForURL('**/register', { timeout: 10_000 });

  const regInputs = page.locator('app-register ion-input input');
  await expect(regInputs.nth(0)).toBeVisible();

  await regInputs.nth(0).fill(client.fullName);         
  await regInputs.nth(1).fill(client.email);            
  await regInputs.nth(2).fill(client.phone);            
  await regInputs.nth(3).fill(client.address);          
  await regInputs.nth(4).fill(client.password);        
  await regInputs.nth(5).fill(client.confirmPassword);  

  const inputValues = await Promise.all([
    regInputs.nth(0).inputValue(),
    regInputs.nth(1).inputValue(),
    regInputs.nth(2).inputValue(),
    regInputs.nth(3).inputValue(),
    regInputs.nth(4).inputValue(),
    regInputs.nth(5).inputValue(),
  ]);

  if (inputValues[0] !== client.fullName) await regInputs.nth(0).fill(client.fullName);
  if (inputValues[1] !== client.email) await regInputs.nth(1).fill(client.email);
  if (inputValues[2] !== client.phone) await regInputs.nth(2).fill(client.phone);
  if (inputValues[3] !== client.address) await regInputs.nth(3).fill(client.address);
  if (inputValues[4] !== client.password) await regInputs.nth(4).fill(client.password);
  if (inputValues[5] !== client.confirmPassword) await regInputs.nth(5).fill(client.confirmPassword);

  await expect(regInputs.nth(0)).toHaveValue(client.fullName);
  await expect(regInputs.nth(1)).toHaveValue(client.email);
  await expect(regInputs.nth(2)).toHaveValue(client.phone);
  await expect(regInputs.nth(3)).toHaveValue(client.address);
  await expect(regInputs.nth(4)).toHaveValue(client.password);
  await expect(regInputs.nth(5)).toHaveValue(client.confirmPassword);

  const registerSubmit = page.getByRole('button', { name: /register/i }).first();
  await expect(registerSubmit).toBeVisible();
  await registerSubmit.click();

  const alert = page.locator('ion-alert, .alert-success, .custom-message'); 
  await alert.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  await alert.locator('ion-button, button').getByText(/cerrar|close/i).first().click().catch(() => {}); 

  await page.waitForURL('**/login', { timeout: 10_000 });

  const loginInputs = page.locator('app-login ion-input input');
  await loginInputs.nth(0).fill(client.email);
  await loginInputs.nth(1).fill(client.password);

  const loginButton = page.getByRole('button', { name: /login/i });
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  const loginAlert = page.locator('ion-alert, .alert-success, .custom-message');
  await loginAlert.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  await loginAlert.locator('ion-button, button').getByText(/cerrar|close/i).first().click().catch(() => {});

  await page.waitForURL('**/home-client', { timeout: 20_000 });
  await expect(page).toHaveURL(/home-client/);

});