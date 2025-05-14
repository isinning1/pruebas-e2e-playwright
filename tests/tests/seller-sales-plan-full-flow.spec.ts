// tests/seller-sales-plan-full-flow.spec.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.setTimeout(180_000);

test('Seller full flow: register, create, edit and view sales plan', async ({ page }) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3_600_000);

  const seller = {
    fullName:  faker.person.fullName(),
    email:     faker.internet.email({ provider: 'example.com' }),
    phone:     '3' + faker.string.numeric(9),
    address:   faker.location.streetAddress({ useFullAddress: true }),
    coverage:  faker.helpers.arrayElement(['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'New York', 'California', 'Texas', 'Florida']),
    specialty: faker.commerce.department(),
    password:  'Prueba4325*',
  };

  const base   = new Date();
  const start  = addHours(base, 1);
  const end    = addHours(base, 2);

  const salesPlan = {
    name:         `Plan ${faker.location.direction()} ${faker.company.buzzNoun()}`,
    description:  faker.lorem.sentence(10),
    visitRoute:   faker.helpers.arrayElement(['Northern Route', 'Southern Route', 'Eastern Route', 'Western Route', 'Downtown', 'Rural Area']),
    salesStrategy:faker.helpers.arrayElement(['Direct Promotion', 'Free Samples', 'Bulk Discount']),
    event:        faker.helpers.arrayElement(['Local Concert', 'Regional Fair', 'Sport Event']),
    dailyGoal:    faker.number.int({ min: 10, max: 25 }).toString(),
    weeklyGoal:   faker.number.int({ min: 50, max: 150 }).toString(),
    startTime:    `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endTime:      `${pad(end.getHours())}:${pad(end.getMinutes())}`,
  };

  const newStart = addHours(base, 3);
  const newEnd   = addHours(base, 4);

  const edited = {
    name:         salesPlan.name + ' Editado',
    description:  faker.lorem.sentence(12),
    visitRoute:   faker.helpers.arrayElement(['Northern Route', 'Southern Route', 'Eastern Route', 'Western Route', 'Downtown', 'Rural Area'].filter(r => r !== salesPlan.visitRoute)),
    salesStrategy:faker.helpers.arrayElement(['Direct Promotion', 'Free Samples', 'Bulk Discount'].filter(s => s !== salesPlan.salesStrategy)),
    event:        faker.helpers.arrayElement(['Local Concert', 'Regional Fair', 'Sport Event'].filter(e => e !== salesPlan.event)),
    dailyGoal:    (Number(salesPlan.dailyGoal) + 2).toString(),
    weeklyGoal:   (Number(salesPlan.weeklyGoal) + 10).toString(),
    startTime:    `${pad(newStart.getHours())}:${pad(newStart.getMinutes())}`,
    endTime:      `${pad(newEnd.getHours())}:${pad(newEnd.getMinutes())}`,
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

  await page.getByRole('button', { name: /create sales plan/i }).click();

  await page.getByLabel(/sales plan name/i).fill(salesPlan.name);
  await page.getByLabel(/plan description/i).fill(salesPlan.description);
  await page.getByLabel(/visit route/i).selectOption({ label: salesPlan.visitRoute });
  await page.getByLabel(/sales strategy/i).selectOption({ label: salesPlan.salesStrategy });
  await page.getByLabel(/event/i).selectOption({ label: salesPlan.event });
  await page.getByLabel(/daily goal/i).fill(salesPlan.dailyGoal);
  await page.getByLabel(/weekly goal/i).fill(salesPlan.weeklyGoal);
  await page.getByLabel(/start time/i).fill(salesPlan.startTime);
  await page.getByLabel(/end time/i).fill(salesPlan.endTime);

  await Promise.all([
    page.getByRole('button', { name: /save/i }).click(),
    page.waitForURL(/seller-dashboard/, { timeout: 20_000 }),
  ]);

  const card = page.locator(`.list-group-item:has-text("${salesPlan.name}")`).first();
  await card.scrollIntoViewIfNeeded();
  const viewBtn = card.getByRole('button', { name: /view details/i });
  await viewBtn.waitFor({ state: 'visible', timeout: 30_000 });
  await viewBtn.click();

  await expect(page.locator('h4')).toHaveText(salesPlan.name);
  await expect(page.locator('p')).toContainText(salesPlan.description);

  await page.getByRole('button', { name: /edit/i }).click();
  await expect(page.locator('input[formcontrolname="name"]')).toHaveValue(salesPlan.name);

  await page.fill('input[formcontrolname="name"]',           edited.name);
  await page.fill('textarea[formcontrolname="description"]', edited.description);
  await page.fill('input[formcontrolname="dailyGoal"]',      edited.dailyGoal);
  await page.fill('input[formcontrolname="weeklyGoal"]',     edited.weeklyGoal);
  await page.fill('input[formcontrolname="startTime"]',      edited.startTime);
  await page.fill('input[formcontrolname="endTime"]',        edited.endTime);

  await page.selectOption('select[formcontrolname="visitRoute"]', { label: edited.visitRoute });
  await page.selectOption('select[formcontrolname="strategy"]',   { label: edited.salesStrategy });
  await page.selectOption('select[formcontrolname="event"]',      { label: edited.event });

  await Promise.all([
    page.getByRole('button', { name: /update/i }).click(),
    page.waitForURL(/seller-dashboard/, { timeout: 20_000 }),
  ]);

  await page.getByRole('button', { name: /logout/i }).click();
});
