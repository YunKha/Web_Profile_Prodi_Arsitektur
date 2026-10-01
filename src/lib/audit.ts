import "server-only";
import { db } from "@/lib/db/client";
import type { SessionUser } from "@/lib/auth/session";

export type AuditAction = "create" | "update" | "delete" | "login" | "logout" | "upload" | "publish";

/** Catat siapa mengubah apa (PRD AD-08). Kegagalan log tidak menggagalkan aksi utama. */
export async function audit(
  user: SessionUser | null,
  action: AuditAction,
  entity: string,
  entityId?: string | number | null,
  diff?: Record<string, unknown>,
) {
  try {
    await db.auditLog.create({
      data: {
        userId: user?.id ?? null,
        action,
        entity,
        entityId: entityId == null ? null : String(entityId),
        diff: diff ? JSON.parse(JSON.stringify(diff)) : undefined,
      },
    });
  } catch (err) {
    console.error("audit log gagal", err);
  }
}
