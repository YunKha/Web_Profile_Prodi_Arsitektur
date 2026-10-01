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

test("halaman admin dialihkan ke login bila belum masuk", async ({ page }) => {
  await page.goto("/admin/berita");
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fberita/);
});

test("login dengan sandi salah menampilkan pesan", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill("sandi-yang-salah-sekali");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Email atau kata sandi salah.")).toBeVisible();
});

test("editor bisa menulis, menerbitkan, lalu menghapus berita", async ({ page }) => {
  test.skip(!email || !password, "SEED_ADMIN_EMAIL/PASSWORD belum diisi");
  const title = `Uji Otomatis ${Date.now()}`;

  await login(page);
  await page.getByRole("link", { name: "Berita", exact: true }).first().click();
  await page.getByRole("link", { name: "Tulis berita" }).click();

  // Validasi: isi kosong ditolak tanpa menghapus judul yang sudah diketik.
  await page.getByRole("textbox", { name: /^Judul/ }).fill(title);
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText("Isi berita wajib diisi.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /^Judul/ })).toHaveValue(title);

  await page.locator(".ProseMirror").click();
  await page.keyboard.type("Paragraf isi berita dari uji otomatis.");
  await page.getByRole("textbox", { name: "Ringkasan" }).fill("Ringkasan uji otomatis.");
  await page.getByRole("radio", { name: "Terbit" }).check();
  await page.getByRole("button", { name: "Simpan" }).click();

  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  // Tampil di situs publik.
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  await page.goto(`/berita/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByText("Paragraf isi berita dari uji otomatis.")).toBeVisible();

  // Hapus.
  await page.goto("/admin/berita");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("row", { name: new RegExp(title) }).getByRole("button", { name: "Hapus" }).click();
  await expect(page.getByRole("status").filter({ hasText: "dihapus" })).toBeVisible();
  await page.goto(`/berita/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("tidak ditemukan");
});
