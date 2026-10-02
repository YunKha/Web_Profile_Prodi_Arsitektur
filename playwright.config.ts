import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

/**
 * Uji alur kritis (PRD §8). Butuh database terisi seed dan akun admin dari .env.
 * Jalankan: `npm run test:e2e` (memakai server dev yang sudah berjalan bila ada).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    locale: "id-ID",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: process.env.E2E_CHANNEL },
    },
  ],
  webServer: {
    command: "npx next build && npx next start -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
