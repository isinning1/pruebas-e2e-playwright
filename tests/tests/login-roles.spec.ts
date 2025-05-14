// tests/login-roles.spec.ts
import { test as base, expect, type APIRequestContext } from '@playwright/test';

const API_BASE =
  process.env.API_BASE ??
  'https://kxa0nfrh14.execute-api.us-east-1.amazonaws.com/prod';

type Creds = { id: string; email: string; password: string };

async function createUser(
  request: APIRequestContext,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<Creds> {
  const res = await request.post(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(body),
  });
  expect(res.status()).toBe(201);
  return { ...(await res.json()), password: body.password as string } as Creds;
}

const test = base.extend<{
  manufacturer: Creds;
  seller: Creds;
  admin: Creds;
}>({
  manufacturer: [
    async ({ request }, use) => {
      const r = Math.floor(Math.random() * 100_000);
      const m = await createUser(request, '/api/create_manufacturer', {
        email: `fabricante_${r}@example.com`,
        password: 'Prueba4325*',
        confirm_password: 'Prueba4325*',
        representative_name: `Rep ${r}`,
        company_name: `Fábrica ${r}`,
        company_address: `Parque Industrial ${r}`,
        phone: `+57-1-${r}`,
        operation_country: 'Colombia',
        tax_id: `RFC${r}`,
      });

      const auth = await request.put(
        `${API_BASE}/auth/manufacturer/${m.id}/authorize`,
      );
      expect(auth.status()).toBe(200);

      await use(m);
    },
    { scope: 'test' },
  ],

  seller: [
    async ({ request }, use) => {
      const r = Math.floor(Math.random() * 100_000);
      await use(
        await createUser(request, '/api/create_seller', {
          email: `seller_${r}@example.com`,
          password: 'Prueba4325*',
          confirm_password: 'Prueba4325*',
          full_name: `Seller ${r}`,
          phone: `+57-1-${r}`,
          address: `Calle ${r}`,
          sector_coverage: 'Zona Norte',
          experience: '2 años',
        }),
      );
    },
    { scope: 'test' },
  ],

  admin: [
    async ({ request }, use) => {
      const r = Math.floor(Math.random() * 100_000);
      await use(
        await createUser(request, '/api/create_admin', {
          email: `admin_${r}@example.com`,
          password: 'Prueba4325*',
          confirm_password: 'Prueba4325*',
          full_name: `Admin ${r}`,
          phone: `+57-1-${r}`,
          department: 'Tecnología',
        }),
      );
    },
    { scope: 'test' },
  ],
});

test.describe('Login por rol con usuarios dinámicos', () => {
  test('Fabricante autorizado → manufacturer-dashboard', async ({ page, manufacturer }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', manufacturer.email);
    await page.fill('input[formcontrolname="contrasena"]', manufacturer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/manufacturer-dashboard/, { timeout: 20_000 });
    await expect(page).toHaveURL(/manufacturer-dashboard/);
  });

  test('Vendedor → seller-dashboard', async ({ page, seller }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', seller.email);
    await page.fill('input[formcontrolname="contrasena"]', seller.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/seller-dashboard/, { timeout: 20_000 });
    await expect(page).toHaveURL(/seller-dashboard/);
  });

  test('Administrador → admin-dashboard', async ({ page, admin }) => {
    await page.goto('/');
    await page.fill('input[formcontrolname="usuario"]', admin.email);
    await page.fill('input[formcontrolname="contrasena"]', admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/admin/, { timeout: 20_000 });
    await expect(page).toHaveURL(/admin/);
  });
});
