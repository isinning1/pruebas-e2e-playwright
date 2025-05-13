import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('Seller full flow: register, create, edit and view sales plan', async ({ page }) => {
  const seller = {
    fullName: faker.person.fullName(),
    email: faker.internet.email({ provider: 'example.com' }),
    phone: '3' + faker.string.numeric(9),
    address: faker.location.streetAddress({ useFullAddress: true }),
    coverageArea: faker.helpers.arrayElement([
      'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'New York', 'California', 'Texas', 'Florida'
    ]),
    specialty: faker.commerce.department(),
    password: faker.internet.password({ length: 10, prefix: 'Aa1!', memorable: false }),
  };

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const startTime = new Date(now.getTime() + 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const salesPlan = {
    name: `Plan ${faker.location.direction()} ${faker.company.buzzNoun()}`,
    description: faker.lorem.sentence(10),
    visitRoute: faker.helpers.arrayElement([
      'Northern Route', 'Southern Route', 'Eastern Route', 'Western Route', 'Downtown', 'Rural Area'
    ]),
    salesStrategy: faker.helpers.arrayElement([
      'Direct Promotion', 'Free Samples', 'Bulk Discount'
    ]),
    event: faker.helpers.arrayElement([
      'Local Concert', 'Regional Fair', 'Sport Event'
    ]),
    dailyGoal: faker.number.int({ min: 10, max: 25 }).toString(),
    weeklyGoal: faker.number.int({ min: 50, max: 150 }).toString(),
    startTime: `${pad(startTime.getHours())}:${pad(startTime.getMinutes())}`,
    endTime: `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}`,
  };

  const newStartTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const newEndTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const editedPlan = {
    name: salesPlan.name + ' Editado',
    description: faker.lorem.sentence(12),
    visitRoute: faker.helpers.arrayElement(
      ['Northern Route', 'Southern Route', 'Eastern Route', 'Western Route', 'Downtown', 'Rural Area']
        .filter(route => route !== salesPlan.visitRoute)
    ),
    salesStrategy: faker.helpers.arrayElement(
      ['Direct Promotion', 'Free Samples', 'Bulk Discount']
        .filter(strategy => strategy !== salesPlan.salesStrategy)
    ),
    event: faker.helpers.arrayElement(
      ['Local Concert', 'Regional Fair', 'Sport Event']
        .filter(event => event !== salesPlan.event)
    ),
    dailyGoal: (parseInt(salesPlan.dailyGoal) + 2).toString(),
    weeklyGoal: (parseInt(salesPlan.weeklyGoal) + 10).toString(),
    startTime: `${pad(newStartTime.getHours())}:${pad(newStartTime.getMinutes())}`,
    endTime: `${pad(newEndTime.getHours())}:${pad(newEndTime.getMinutes())}`,
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
  await page.waitForTimeout(10000);

  await page.getByLabel('Enter your email').fill(seller.email);
  await page.getByLabel('Enter your password').fill(seller.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/seller-dashboard/, { timeout: 10000 });

  await page.getByRole('button', { name: /Create Sales Plan/i }).click();
  await page.getByLabel('Sales Plan Name *').fill(salesPlan.name);
  await page.getByLabel('Plan Description').fill(salesPlan.description);
  await page.getByLabel('Visit Route').selectOption({ label: salesPlan.visitRoute });
  await page.getByLabel('Sales Strategy').selectOption({ label: salesPlan.salesStrategy });
  await page.getByLabel('Event').selectOption({ label: salesPlan.event });
  await page.getByLabel('Daily Goal *').fill(salesPlan.dailyGoal);
  await page.getByLabel('Weekly Goal *').fill(salesPlan.weeklyGoal);
  await page.getByLabel('Start Time').fill(salesPlan.startTime);
  await page.getByLabel('End Time').fill(salesPlan.endTime);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForURL(/seller-dashboard/, { timeout: 12000 });

  await expect(page.locator('text=' + salesPlan.name)).toBeVisible({ timeout: 12000 });
  await page.getByRole('button', { name: /View details/i }).click();

  await expect(page.locator('h4')).toContainText(salesPlan.name);
  await expect(page.locator('p')).toContainText(salesPlan.description);

  await page.getByRole('button', { name: /Edit/i }).click();


  await expect(
  page.locator('input[formcontrolname="name"]')
  ).toHaveValue(salesPlan.name, { timeout: 10_000 });


  await page.fill('input[formcontrolname="name"]',           editedPlan.name);
  await page.fill('textarea[formcontrolname="description"]', editedPlan.description);
  await page.fill('input[formcontrolname="dailyGoal"]',      editedPlan.dailyGoal);
  await page.fill('input[formcontrolname="weeklyGoal"]',     editedPlan.weeklyGoal);
  await page.fill('input[formcontrolname="startTime"]',      editedPlan.startTime);
  await page.fill('input[formcontrolname="endTime"]',        editedPlan.endTime);

  await page.selectOption('select[formcontrolname="visitRoute"]', { label: editedPlan.visitRoute });
  await page.selectOption('select[formcontrolname="strategy"]',   { label: editedPlan.salesStrategy }); 
  await page.selectOption('select[formcontrolname="event"]',      { label: editedPlan.event });

  await page.getByRole('button', { name: /update/i }).click();

  await expect(page).toHaveURL('/seller-dashboard');

  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 20000 });
  await page.getByRole('button', { name: /logout/i }).click();
});


