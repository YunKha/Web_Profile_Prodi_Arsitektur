import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Kunci unik per request untuk `key` formulir admin. Cache Components
 * mempertahankan state UI antar navigasi (React <Activity>), jadi tanpa kunci
 * baru formulir bisa menampilkan isian lama setelah disimpan.
 */
export async function newFormKey(): Promise<string> {
  return randomUUID();
}

export async function thisYear(): Promise<number> {
  return new Date().getFullYear();
}
