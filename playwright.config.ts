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
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "id-ID",
  },
  projects: [
    {
      name: "desktop",
      // Memakai Microsoft Edge/Chrome yang terpasang agar tidak perlu mengunduh browser.
      use: { ...devices["Desktop Chrome"], channel: process.env.E2E_CHANNEL ?? "msedge" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
