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

async function savePage(page: Page) {
  await page.getByRole("button", { name: "Simpan halaman" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
}

test("struktur organisasi diunggah di admin lalu tampil di Visi & Misi", async ({ page }) => {
  const seedAlt = "Bagan struktur organisasi Program Studi Arsitektur";
  const testAlt = `Bagan struktur uji ${Date.now()}`;
  await login(page);
  await page.goto("/admin/halaman/profil");
  const section = page.locator("section").filter({ has: page.getByRole("heading", { name: "Struktur Organisasi" }) });
  const dialog = page.locator("dialog[open]");
  await page.waitForLoadState("networkidle");
  // Seed sudah memasang bagan contoh, jadi tombolnya "Ganti" (atau "Pilih…" bila dilepas).
  await section.getByRole("button", { name: /Pilih atau unggah gambar|^Ganti$/ }).click();
  await dialog.getByPlaceholder(/Mis\. Mahasiswa/).fill(testAlt);
  await dialog.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "prisma", "seed-assets", "cta-model.jpg"));
  await expect(dialog).toHaveCount(0);
  await savePage(page);

  await page.goto("/profil");
  const struktur = page.locator("#struktur-organisasi");
  await expect(struktur.getByRole("heading", { name: "Struktur Organisasi" })).toBeVisible();
  await expect(struktur.getByRole("img", { name: testAlt })).toBeVisible();

  // Kembalikan bagan contoh dari pustaka media.
  await page.goto("/admin/halaman/profil");
  await page.waitForLoadState("networkidle");
  await section.getByRole("button", { name: "Ganti" }).click();
  await dialog.getByPlaceholder("Cari nama file atau teks alternatif…").fill("struktur-organisasi");
  await dialog.getByRole("button", { name: seedAlt }).click();
  await expect(dialog).toHaveCount(0);
  await savePage(page);
  await page.goto("/profil");
  await expect(struktur.getByRole("img", { name: seedAlt })).toBeVisible();

  // Hapus file uji yang sudah tidak dipakai.
  await page.goto("/admin/media");
  await expect(page.locator("main ul li").first()).toBeVisible();
  await page.getByRole("button", { name: testAlt }).first().click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Hapus file" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Media dihapus." })).toBeVisible();
});

test("tautan Drive tracer study, repositori TA, dan roadmap penelitian", async ({ page }) => {
  await login(page);
  const cases = [
    { key: "alumni", block: "tracer", url: "https://drive.google.com/drive/folders/uji-tracer", path: "/mahasiswa/alumni", label: "Lihat Bukti Tracer Study" },
    { key: "panduan-ta", block: "repositori", url: "https://drive.google.com/drive/folders/uji-repo", path: "/akademik/panduan-ta", label: "Buka Repositori Judul TA" },
    { key: "penelitian", block: "roadmap", url: "https://drive.google.com/drive/folders/uji-roadmap", path: "/penelitian", label: "Lihat Dokumen Roadmap" },
  ];
  for (const c of cases) {
    await page.goto(`/admin/halaman/${c.key}`);
    await page.locator(`input[name="${c.block}.linkUrl"]`).fill(c.url);
    await savePage(page);
    await page.goto(c.path);
    await expect(page.getByRole("link", { name: new RegExp(c.label) })).toHaveAttribute("href", c.url);
  }
  // URL tidak valid ditolak dengan pesan di field.
  await page.goto("/admin/halaman/alumni");
  await page.locator('input[name="tracer.linkUrl"]').fill("drive.google.com/tanpa-https");
  await page.getByRole("button", { name: "Simpan halaman" }).click();
  await expect(page.getByText("Masukkan URL lengkap diawali https://")).toBeVisible();

  for (const c of cases) {
    await page.goto(`/admin/halaman/${c.key}`);
    await page.locator(`input[name="${c.block}.linkUrl"]`).fill("");
    await savePage(page);
  }
  await page.goto("/mahasiswa/alumni");
  await expect(page.getByRole("link", { name: /Lihat Bukti Tracer Study/ })).toHaveCount(0);
});

test("tahapan setiap jalur TA diatur sendiri dari admin", async ({ page }) => {
  await login(page);
  await page.goto("/admin/jalur-ta");
  await page.getByRole("link", { name: "Jalur Riset" }).click();
  const rows = page.locator('ol li:has(textarea)');
  const before = await rows.count();
  await page.getByRole("button", { name: "Tambah tahap" }).click();
  await page.getByRole("textbox", { name: `Nama tahap baris ${before + 1}` }).fill("Publikasi Artikel Uji");
  await page.getByRole("textbox", { name: `Uraian baris ${before + 1}` }).fill("Artikel diunggah ke jurnal mitra.");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

  await page.goto("/akademik/panduan-ta");
  await page.getByRole("tab", { name: "Jalur Riset" }).click();
  await expect(page.getByRole("tabpanel").getByRole("heading", { name: "Publikasi Artikel Uji" })).toBeVisible();
  await page.getByRole("tab", { name: "Jalur Desain" }).click();
  await expect(page.getByRole("tabpanel").getByRole("heading", { name: "Publikasi Artikel Uji" })).toHaveCount(0);

  // Bersihkan.
  await page.goto("/admin/jalur-ta");
  await page.getByRole("link", { name: "Jalur Riset" }).click();
  await page.getByRole("button", { name: "Hapus baris" }).last().click();
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
});

test("sertifikasi profesi, serdos, jenjang Profesi, dan WoS ID dosen", async ({ page }) => {
  await login(page);
  await page.goto("/admin/dosen");
  await page.getByRole("link", { name: /Budi Santoso/ }).click();
  await expect(page.getByLabel("Kelompok bidang keahlian")).toHaveValue("perancangan");
  await expect(page.getByLabel("Web of Science ResearcherID")).toHaveValue("AAB-1234-2019");

  // Sertifikasi profesi wajib lengkap per baris.
  await page.getByRole("button", { name: "Tambah sertifikasi" }).click();
  const n = await page.getByRole("textbox", { name: /^Nomor sertifikat baris/ }).count();
  await page.getByRole("textbox", { name: `Nomor sertifikat baris ${n}` }).fill("UJI-0001");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByText(new RegExp(`Baris ${n}: Institusi penerbit wajib diisi`))).toBeVisible();
  await page.getByRole("textbox", { name: `Institusi penerbit baris ${n}` }).fill("Lembaga Uji");
  await page.getByRole("textbox", { name: `Gelar / sebutan profesi baris ${n}` }).fill("Gelar Uji");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();

  await page.goto("/profil/dosen-staf/budi-santoso");
  await expect(page.getByRole("heading", { name: "Sertifikasi Profesi" })).toBeVisible();
  await expect(page.getByText("Gelar Uji")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sertifikasi Dosen" })).toBeVisible();
  await expect(page.getByText("Web of Science ID")).toBeVisible();
  await expect(page.getByText("Pendidikan Profesi Arsitek")).toBeVisible();

  // Bersihkan: hapus sertifikasi uji (baris terakhir).
  await page.goto("/admin/dosen");
  await page.getByRole("link", { name: /Budi Santoso/ }).click();
  const certSection = page.locator("section").filter({ has: page.getByRole("heading", { name: "Sertifikasi profesi" }) });
  await certSection.getByRole("button", { name: "Hapus baris" }).last().click();
  await page.getByRole("button", { name: "Simpan" }).click();
  await expect(page.getByRole("status").filter({ hasText: "disimpan" })).toBeVisible();
});
