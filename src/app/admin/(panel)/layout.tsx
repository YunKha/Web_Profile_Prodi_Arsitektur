import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireUser } from "@/lib/auth/session";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <AdminSidebar user={user} />
      <div className="lg:pl-64">
        <main id="konten" className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </>
  );
}

function ShellSkeleton() {
  return (
    <>
      <div className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block" />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-10">
          <ContentSkeleton />
        </div>
      </div>
    </>
  );
}

function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-grey-100" />
      <div className="h-96 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
