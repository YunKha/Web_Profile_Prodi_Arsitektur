import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12;
// Hash acak untuk membandingkan saat email tidak ditemukan, agar waktu respons
// tidak membocorkan apakah sebuah email terdaftar.
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5k6Jv1a0w0p7m0hX9mJXy5pQq8f1q2a";

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return Boolean(hash) && ok;
}

export const PASSWORD_MIN = 12;
