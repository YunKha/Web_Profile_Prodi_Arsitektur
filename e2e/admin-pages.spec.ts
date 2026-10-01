import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const email = process.env.SEED_ADMIN_EMAIL ?? "";
const password = process.env.SEED_ADMIN_PASSWORD ?? "";

test.describe.configure({ mode: "serial" });
test.skip(!email || !password, "SEED_ADMIN_EMAIL/PASSWORD belum diisi");

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Halo");
}

const modules = [
  "berita",
  "prestasi",
  "penelitian",
  "pengabdian",
  "dosen",
  "akreditasi",
  "fasilitas",
  "mata-kuliah",
  "dokumen",
  "program",
  "lembaga",
  "alumni",
  "kerja-sama",
];
const singles = ["kategori", "halaman", "halaman/profil", "halaman/beranda", "media", "pengaturan", "pengguna", "pengguna/baru", "log", "akun"];

test("semua halaman admin terbuka tanpa galat", async ({ page }) => {
  test.setTimeout(10 * 60_000); // mode dev mengompilasi tiap rute saat pertama dibuka
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);

  for (const m of modules) {
    await page.goto(`/admin/${m}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByText("Terjadi kesalahan")).toHaveCount(0);

    // Halaman edit baris pertama (bila ada).
    const first = page.locator("main tbody a[href^='/admin/']").first();
    if (await first.count()) {
      const href = await first.getAttribute("href");
      await page.goto(href as string);
      await expect(page.getByRole("button", { name: "Simpan" }).first()).toBeVisible();
    }

    await page.goto(`/admin/${m}/baru`);
    await expect(page.getByRole("button", { name: "Simpan" }).first()).toBeVisible();
  }

  for (const s of singles) {
    await page.goto(`/admin/${s}`);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByText("Terjadi kesalahan")).toHaveCount(0);
  }
  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("perubahan blok halaman langsung tampil di situs publik", async ({ page }) => {
  await login(page);
  const marker = `Teks uji ${Date.now()}`;
  await page.goto("/admin/halaman/berita");
  const body = page.locator('textarea[name="hero.body"]');
  const original = await body.inputValue();
  await body.fill(marker);
  await page.getByRole("button", { name: "Simpan halaman" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

  await page.goto("/berita");
  await expect(page.getByText(marker)).toBeVisible();

  // Kembalikan isi semula.
  await page.goto("/admin/halaman/berita");
  await page.locator('textarea[name="hero.body"]').fill(original);
  await page.getByRole("button", { name: "Simpan halaman" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
});

test("unggah gambar ke pustaka media lalu hapus", async ({ page }) => {
  await login(page);
  await page.goto("/admin/media");
  // Grid diisi dari klien; munculnya item menandakan komponen sudah ter-hydrate.
  await expect(page.locator("main ul li").first()).toBeVisible();
  const file = path.join(process.cwd(), "prisma", "seed-assets", "partner-1.jpg");
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole("status").filter({ hasText: "1 file diunggah" })).toBeVisible();

  // File yang dipakai konten ditolak dihapus.
  await page.getByRole("button", { name: "Logo mitra" }).first().click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Hapus file" }).click();
  await expect(page.getByRole("status").filter({ hasText: "masih dipakai" })).toBeVisible();

  // File baru (alt diambil dari nama file) bisa dihapus.
  await page.getByRole("button", { name: "partner 1", exact: true }).first().click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Hapus file" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Media dihapus." })).toBeVisible();
});

test("peran Editor tidak bisa membuka halaman khusus Admin", async ({ page }) => {
  const editorEmail = `editor.uji.${Date.now()}@untad.local`;
  const editorPass = "sandi-editor-uji-123";

  await login(page);
  await page.goto("/admin/pengguna/baru");
  await page.getByRole("textbox", { name: /^Nama/ }).fill("Editor Uji");
  await page.getByRole("textbox", { name: /^Email/ }).fill(editorEmail);
  await page.getByLabel(/^Kata sandi/).fill(editorPass);
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);

  await page.getByLabel("Email").fill(editorEmail);
  await page.getByLabel("Kata sandi", { exact: true }).fill(editorPass);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Halo");
  await expect(page.getByRole("link", { name: "Pengaturan" })).toHaveCount(0);
  await page.goto("/admin/pengaturan");
  await expect(page).toHaveURL(/forbidden=1/);
  await expect(page.getByText("hanya untuk peran Admin")).toBeVisible();
  await page.getByRole("button", { name: "Keluar" }).click();

  await login(page);
  await page.goto("/admin/pengguna");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("row").filter({ hasText: editorEmail }).getByRole("button", { name: "Hapus" }).click();
  await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
});
