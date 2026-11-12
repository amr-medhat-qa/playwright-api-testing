import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export const BASE_URL = process.env.BASE_URL ?? 'https://dummyjson.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  reporter: [
    ...(isCI
      ? ([['github'], ['list'], ['html', { open: 'never' }]] as const)
      : ([['list'], ['html', { open: 'never' }]] as const)),
    ['allure-playwright', { resultsDir: 'allure-results', environmentInfo: { BASE_URL, Node: process.version } }],
  ],
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
});
