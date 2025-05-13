import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    // Web Angular (Local)
    {
      name: 'Web Angular (Local)',
      testMatch: /.*tests\/tests\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['Desktop Chrome'],
      },
    },

    // Web Angular (Producción)
    {
      name: 'Web Angular (Producción)',
      testMatch: /.*tests\/tests\/.*\.spec\.ts/,
      use: {
        baseURL: 'https://main.d2sk28qnzn31cz.amplifyapp.com',
        ...devices['Desktop Chrome'],
      },
    },

    // 📱 Mobile Ionic (Local)
    {
      name: 'Mobile Ionic (Local)',
      testMatch: /.*tests\/mobile\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:8100',
        ...devices['iPhone 12'],
      },
    },

    // Mobile Ionic (Producción) (comentado por ahora)
    // {
    //   name: 'Mobile Ionic (Producción)',
    //   testMatch: /.*tests\/mobile\/.*\.spec\.ts/,
    //   use: {
    //     baseURL: 'https://app.misitio.com', // Reemplaza si haces deploy móvil (PWA)
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],

  /**
   * Si deseas levantar servidores automáticamente antes de correr pruebas, descomenta esto:
   */
  // webServer: [
  //   {
  //     command: 'npm run start',
  //     url: 'http://localhost:4200',
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'ionic serve',
  //     url: 'http://localhost:8100',
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
});
