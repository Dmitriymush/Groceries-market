import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run api',
      port: 3001,
      reuseExistingServer: true,
      cwd: '..',
    },
    {
      command: 'npm run start',
      port: 4200,
      reuseExistingServer: true,
      timeout: 120000,
      cwd: '..',
    },
  ],
});
