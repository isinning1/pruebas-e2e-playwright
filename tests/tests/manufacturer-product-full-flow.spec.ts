import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const API_BASE =
  process.env.API_BASE ??
  'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

test.setTimeout(120_000);

test('Manufacturer: register → approve → create & edit product', async ({ page, request }) => {
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
    expDate:     faker.date.future({ years: 1 }).toISOString().split('T')[0],
    delivery:    '15',
    storageCond: 'Keep in a dry place',
    commCond:    'FOB',
    warehouseIdx: 1,
  };

  const edited = { price: '18', stock: '12' };

  await page.goto('/');
  await page.getByRole('link', { name: /register as manufacturer/i }).click();
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
  await expect(page.locator('.toast-body')).toHaveText(/pending validation/i, { timeout: 15000 });

  const adminId = Math.floor(Math.random() * 100_000);
  const adminEmail = `admin_${adminId}@example.com`;
  const adminPassword = 'Prueba4325*';

  const res = await request.post(`${API_BASE}/api/create_admin`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      email:             adminEmail,
      password:          adminPassword,
      confirm_password:  adminPassword,
      full_name:         `Admin ${adminId}`,
      phone:             `+57-1-${adminId}`,
      department:        'Tecnología',
    }),
  });
  expect(res.status()).toBe(201);

  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  await page.locator('input[formcontrolname="usuario"]').fill(adminEmail);
  await page.locator('input[formcontrolname="contrasena"]').fill(adminPassword);
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL(/admin/, { timeout: 20000 });
  const warningRow = page.locator('tbody tr', { hasText: '⚠️' })
                          .filter({ hasText: manufacturer.email }).first();
  await warningRow.getByRole('button', { name: /authorize/i }).click();
  await expect(page.locator('.alert-success')).toBeVisible();

  await page.getByRole('button', { name: /logout/i }).click();
  await page.locator('input[formcontrolname="usuario"]').fill(manufacturer.email);
  await page.locator('input[formcontrolname="contrasena"]').fill(manufacturer.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/manufacturer-dashboard/);

  await page.getByRole('button', { name: /create product/i }).click();
  await page.getByLabel(/product name/i).fill(product.name);
  await page.getByLabel(/description/i).fill(product.description);
  await page.getByLabel(/category/i).fill(product.category);
  await page.locator('input[formcontrolname="price"]').fill(product.price);
  await page.getByLabel(/^currency/i).selectOption(product.currency);
  await page.locator('input[formcontrolname="stock"]').fill(product.stock);
  await page.getByLabel(/^sku/i).fill(product.sku);
  await page.locator('input[type="date"]').fill(product.expDate);

  const imageUrl = 'https://assetsccp.s3.us-east-1.amazonaws.com/CocaColaPruebasE2E.png';
  const imgBuffer = await (await request.get(imageUrl)).body();
  await page.setInputFiles('input[type="file"]', {
    name: 'CocaColaPruebasE2E.png',
    mimeType: 'image/png',
    buffer: imgBuffer,
  });
  await page.getByLabel(/estimated delivery time/i).fill(product.delivery);
  await page.getByLabel(/storage condition/i).fill(product.storageCond);
  await page.getByLabel(/commercial condition/i).fill(product.commCond);
  await page.locator('select[formcontrolname="warehouse"]').selectOption({ index: product.warehouseIdx });
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForResponse(r => r.url().includes('/products') && r.ok());
  await expect(page).toHaveURL(/manufacturer-dashboard/);

  const prodRow = page.locator('.list-group-item', { hasText: product.name }).first();
  await prodRow.getByRole('button', { name: /view details/i }).click();
  await page.getByRole('button', { name: /edit/i }).click();
  await page.locator('input[formcontrolname="price"]').fill(edited.price);
  await page.locator('input[formcontrolname="stock"]').fill(edited.stock);
  await page.getByRole('button', { name: /update/i }).click();
  await page.waitForResponse(r => r.url().includes('/products') && r.request().method() === 'PUT' && r.ok());
  await expect(page).toHaveURL(/manufacturer-dashboard/);


  await page.getByRole('button', { name: /logout/i }).click();
});
