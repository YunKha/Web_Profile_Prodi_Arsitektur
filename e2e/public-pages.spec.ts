import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('Homepage has Hero section and Navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigation bar
    await expect(page.locator('nav').first()).toBeVisible();

    // Hero title
    await expect(page.locator('h1').first()).toBeVisible();

    // Gradient overlay
    const gradientOverlay = page.locator('div[aria-hidden].absolute.inset-0.-z-10').first();
    await expect(gradientOverlay).toHaveClass(/bg-\[linear-gradient/);

    // Hubungi Kami button
    await expect(page.getByRole('link', { name: /Hubungi Kami/i }).first()).toBeVisible();
  });

  test('Profil page loads', async ({ page }) => {
    await page.goto('/profil');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Berita page loads', async ({ page }) => {
    await page.goto('/berita');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Fasilitas page loads', async ({ page }) => {
    await page.goto('/fasilitas');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Akademik RPS page loads', async ({ page }) => {
    await page.goto('/akademik/rps');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Akademik Panduan TA page loads', async ({ page }) => {
    await page.goto('/akademik/panduan-ta');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Mahasiswa Kegiatan Akademik page loads', async ({ page }) => {
    await page.goto('/mahasiswa/kegiatan-akademik');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Mahasiswa Prestasi page loads', async ({ page }) => {
    await page.goto('/mahasiswa/prestasi');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Penelitian page loads', async ({ page }) => {
    await page.goto('/penelitian');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Pengabdian page loads', async ({ page }) => {
    await page.goto('/pengabdian');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Kerja Sama page loads', async ({ page }) => {
    await page.goto('/kerja-sama');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Profil Akreditasi page loads', async ({ page }) => {
    await page.goto('/profil/akreditasi');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Profil Dosen Staf page loads', async ({ page }) => {
    await page.goto('/profil/dosen-staf');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Akademik Kurikulum page loads', async ({ page }) => {
    await page.goto('/akademik/kurikulum');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Mahasiswa Kegiatan Nonakademik page loads', async ({ page }) => {
    await page.goto('/mahasiswa/kegiatan-nonakademik');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Mahasiswa Lembaga page loads', async ({ page }) => {
    await page.goto('/mahasiswa/lembaga');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Mahasiswa Alumni page loads', async ({ page }) => {
    await page.goto('/mahasiswa/alumni');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Pengabdian Dosen page loads', async ({ page }) => {
    await page.goto('/pengabdian/dosen');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Pengabdian Mahasiswa page loads', async ({ page }) => {
    await page.goto('/pengabdian/mahasiswa');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
