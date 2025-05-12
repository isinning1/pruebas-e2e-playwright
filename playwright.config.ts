import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'Web Angular (Local)',
      use: {
        baseURL: 'http://localhost:4200',
        ...devices['Desktop Chrome'],
      },
    },

  
  //  {
  //    name: 'Mobile Ionic (Local)',
  //    use: {
  //      baseURL: 'http://localhost:8100',
  //      ...devices['iPhone 12'],
  //    },
  //  },
    

    {
      name: 'Web Angular (Producción)',
      use: {
        baseURL: 'https://main.d2sk28qnzn31cz.amplifyapp.com',
        ...devices['Desktop Chrome'],
      },
    },

    // (Opcional futuro): Mobile en producción (si se hace un deploy móvil tipo PWA)
    // {
    //   name: 'Mobile Ionic (Producción)',
    //   use: {
    //     baseURL: 'https://app.misitio.com',
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],

  /**
   * Si se desea levantar los servidores automáticamente antes de probar, descomente esto:
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
  //   }
  // ]

});
