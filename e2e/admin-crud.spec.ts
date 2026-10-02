import { expect, test, type Page } from "@playwright/test";

const email = process.env.SEED_ADMIN_EMAIL ?? "";
const password = process.env.SEED_ADMIN_PASSWORD ?? "";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Halo");
}

test.describe("Admin CRUD", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!email || !password, "SEED_ADMIN_EMAIL/PASSWORD belum diisi");
    await login(page);
  });

  test("CRUD Dosen", async ({ page }) => {
    const name = `Dosen ${Date.now()}`;
    await page.goto("/admin/dosen");
    await page.getByRole("link", { name: /Tambah|Baru/i }).click();

    // Create
    await page.getByRole("textbox", { name: /Nama lengkap/i }).fill(name);
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
    
    // Update
    await page.getByRole("link", { name }).click();
    await page.getByRole("textbox", { name: /Gelar depan/i }).fill("Dr.");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

    // Delete
    await page.goto("/admin/dosen");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  });

  test("CRUD Fasilitas", async ({ page }) => {
    const name = `Fasilitas ${Date.now()}`;
    await page.goto("/admin/fasilitas");
    await page.getByRole("link", { name: /Tambah|Baru/i }).click();

    // Create
    await page.getByRole("textbox", { name: /Nama fasilitas/i }).fill(name);
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
    
    // Update
    await page.getByRole("link", { name }).click();
    await page.getByRole("textbox", { name: /Label tab/i }).fill("Fas Tab");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

    // Delete
    await page.goto("/admin/fasilitas");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  });

  test("CRUD Prestasi", async ({ page }) => {
    const name = `Prestasi ${Date.now()}`;
    await page.goto("/admin/prestasi");
    await page.getByRole("link", { name: /Tambah|Baru/i }).click();

    // Create
    await page.locator('input[name="title"]').fill(name);
    await page.getByRole("textbox", { name: /Nama mahasiswa/i }).fill("Mahasiswa X");
    await page.locator('input[name="achievementYear"]').fill("2024");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
    
    // Update
    await page.getByRole("link", { name }).click();
    await page.getByRole("textbox", { name: /Peringkat/i }).fill("Juara 1");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

    // Delete
    await page.goto("/admin/prestasi");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  });

  test("CRUD Penelitian", async ({ page }) => {
    const name = `Penelitian ${Date.now()}`;
    await page.goto("/admin/penelitian");
    await page.getByRole("link", { name: /Tambah|Baru/i }).click();

    // Create
    await page.locator('input[name="title"]').fill(name);
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
    
    // Update
    await page.getByRole("link", { name }).click();
    await page.locator('input[name="year"]').first().fill("2024");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

    // Delete
    await page.goto("/admin/penelitian");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  });

  test("CRUD Akreditasi", async ({ page }) => {
    const name = `BAN-PT ${Date.now()}`;
    const sk = `123/SK/${Date.now()}`;
    await page.goto("/admin/akreditasi");
    await page.getByRole("link", { name: /Tambah|Baru/i }).click();

    // Create
    await page.getByRole("textbox", { name: /Lembaga akreditasi/i }).fill(name);
    await page.getByRole("textbox", { name: /Nomor SK/i }).fill(sk);
    await page.getByRole("textbox", { name: /Peringkat/i }).fill("Unggul");
    await page.locator('input[name="validFrom"]').fill("2024-01-01");
    await page.locator('input[name="validTo"]').fill("2029-01-01");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
    
    // Update
    await page.getByRole("link", { name: sk }).click();
    await page.getByRole("textbox", { name: /Nomor SK/i }).fill(sk + "-Rev");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

    // Delete
    await page.goto("/admin/akreditasi");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row", { name: new RegExp(sk + "-Rev") }).getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  });

  test("CRUD Kerja Sama", async ({ page }) => {
    const name = `Mitra ${Date.now()}`;
    await page.goto("/admin/kerja-sama");
    await page.getByRole("link", { name: /Tambah|Baru/i }).click();

    // Create
    await page.getByRole("textbox", { name: /Nama mitra/i }).fill(name);
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
    
    // Update
    await page.goto("/admin/kerja-sama");
    await page.getByRole("link", { name }).click();
    await page.locator('input[name="partnerType"]').first().fill("Industri", { force: true });
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

    // Delete
    await page.goto("/admin/kerja-sama");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Hapus" }).click();
    await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  });
});
