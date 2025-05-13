// tests/manufacturer-product-full-flow.spec.ts
import { test, expect, request } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.setTimeout(120_000);          // timeout global

test('Manufacturer: register → approve → create & edit product', async ({ page }) => {
  /* ---------- 1. Datos ---------- */
  const manufacturer = {
    fullName:  faker.person.fullName(),
    company:   faker.company.name(),
    address:   faker.location.streetAddress({ useFullAddress: true }),
    email:     faker.internet.email(),
    phone:     '3' + faker.string.numeric(9),
    country:   'Colombia',
    ruc:       faker.string.numeric({ length: 13 }),
    password:  'Prueba4325*',
  };

  const product = {
    name:        `Prod ${faker.commerce.productAdjective()} ${Date.now()}`,
    description: faker.commerce.productDescription().slice(0, 60),
    category:    faker.commerce.department(),
    price:       '15',
    currency:    'COP',
    stock:       '10',
    sku:         faker.string.alphanumeric(8).toUpperCase(),
    expDate:     faker.date.future({ years: 1 }).toISOString().split('T')[0], // yyyy-mm-dd
    delivery:    '15',
    storageCond: 'Keep in a dry place',
    commCond:    'FOB',
    warehouseIdx: 1,
  };

  const edited = { price: '18', stock: '12' };

  /* ---------- 2. Registro fabricante ---------- */
  await page.goto('/');
  await page.getByRole('link', { name: /register as manufacturer/i }).click();
  await expect(page.locator('form')).toBeVisible();

  await page.getByLabel(/full name of the representative/i).fill(manufacturer.fullName);
  await page.getByLabel(/company name/i).fill(manufacturer.company);
  await page.getByLabel(/company address/i).fill(manufacturer.address);
  await page.getByLabel(/^email/i).fill(manufacturer.email);
  await page.getByLabel(/phone number/i).fill(manufacturer.phone);
  await page.getByLabel(/country of operation/i).selectOption(manufacturer.country);
  await page.getByLabel(/tax id|ruc/i).fill(manufacturer.ruc);
  await page.getByLabel(/^password \*/i).fill(manufacturer.password);
  await page.getByLabel(/confirm password \*/i).fill(manufacturer.password);
  await page.getByRole('button', { name: /submit/i }).click();

  /* espera al toast ⇒ backend terminó */
  await expect(page.locator('.toast-body'))
    .toHaveText(/(under review|pending validation|wait for approval)/i, { timeout: 15_000 });

  /* ---------- 3. Aprobación admin ---------- */
  await page.getByLabel(/^email/i).fill('admin_27538@example.com');
  await page.getByLabel(/^password/i).fill('Prueba4325*');
  await page.getByRole('button', { name: /login/i }).click();

  await page.getByText(/authorizations/i).click();
  const warningRow = page.locator('tbody tr', { hasText: '⚠️' }).first();
  const pendingEmail = await warningRow.locator('td').nth(1).innerText();
  await page.getByPlaceholder(/search/i).fill(pendingEmail);

  const filteredRow = page.locator('tbody tr').first();
  await expect(filteredRow).toContainText(pendingEmail);
  await filteredRow.getByRole('button', { name: /authorize|approve/i }).click();
  await expect(page.locator('.alert-success')).toBeVisible();
  await page.getByRole('button', { name: /logout/i }).click();

  /* ---------- 4. Login fabricante ---------- */
  await page.getByLabel(/^email/i).fill(manufacturer.email);
  await page.getByLabel(/^password/i).fill(manufacturer.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('**/manufacturer-dashboard');

  /* ---------- 5. Crear producto ---------- */
  await page.getByRole('button', { name: /create product/i }).click();
  await expect(page.locator('form')).toBeVisible();

  await page.getByLabel(/product name/i).fill(product.name);
  await page.getByLabel(/description/i).fill(product.description);
  await page.getByLabel(/category/i).fill(product.category);
  await page.locator('input[formcontrolname="price"]').fill(product.price);
  await page.getByLabel(/^currency/i).selectOption(product.currency);
  await page.locator('input[formcontrolname="stock"]').fill(product.stock);
  await page.getByLabel(/^sku/i).fill(product.sku);
  await page.locator('input[type="date"]').fill(product.expDate);

  /* ==== carga de imagen desde S3 ==== */
  const imageUrl = 'https://assetsccp.s3.us-east-1.amazonaws.com/CocaColaPruebasE2E.png';
  const reqCtx   = await request.newContext();
  const resp     = await reqCtx.get(imageUrl);
  expect(resp.ok()).toBeTruthy();
  const buffer = await resp.body();

  await page.setInputFiles('input[type="file"]', {
    name: 'CocaColaPruebasE2E.png',
    mimeType: 'image/png',
    buffer,
  });

  await page.getByLabel(/estimated delivery time/i).fill(product.delivery);
  await page.getByLabel(/storage condition/i).fill(product.storageCond);
  await page.getByLabel(/commercial condition/i).fill(product.commCond);
  await page.locator('select[formcontrolname="warehouse"]')
            .selectOption({ index: product.warehouseIdx });

  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForResponse(r => r.url().includes('/products') && r.ok());
  await expect(page).toHaveURL('**/manufacturer-dashboard');

  /* ---------- 6. Detalle ---------- */
  const prodRow = page.locator('.list-group-item', { hasText: product.name }).first();
  await prodRow.scrollIntoViewIfNeeded();
  await prodRow.getByRole('button', { name: /view details/i }).click();
  await expect(page.locator('h4')).toHaveText(product.name);

  /* ---------- 7. Editar ---------- */
  await page.getByRole('button', { name: /edit/i }).click();
  await expect(page.locator('input[formcontrolname="price"]')).toHaveValue(product.price);

  await page.locator('input[formcontrolname="price"]').fill(edited.price);
  await page.locator('input[formcontrolname="stock"]').fill(edited.stock);
  await page.getByRole('button', { name: /update/i }).click();

  await page.waitForResponse(r => r.url().includes('/products') && r.request().method() === 'PUT' && r.ok());
  await expect(page).toHaveURL(/\/manufacturer\/product\/.*/);
  await expect(page.locator('li.list-group-item')).toContainText(edited.price);

  /* ---------- 8. Volver y logout ---------- */
  await page.getByRole('button', { name: /cancel|back/i }).click();
  await expect(page).toHaveURL('**/manufacturer-dashboard');
  await page.getByRole('button', { name: /logout/i }).click();
});
