import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3101',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROME === '1' ? { channel: 'chrome' } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run start -- --port 3101',
    url: 'http://127.0.0.1:3101',
    reuseExistingServer: false,
    timeout: 90_000,
    env: { DATA_DIR: resolve('artifacts/e2e-data'), RATE_LIMIT_SECRET: 'isolated-test-rate-secret', RESEND_API_KEY: '', EMAIL_FROM: '', LEAD_NOTIFICATION_EMAIL: '', SLACK_WEBHOOK_URL: '', SLACK_BOT_TOKEN: '', SLACK_ADMIN_TOKEN: '', NEXT_TELEMETRY_DISABLED: '1' },
  },
});
