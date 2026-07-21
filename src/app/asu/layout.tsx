import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { clearAdminSession, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // login page has its own minimal chrome via path check in page; layout still wraps
  // but we only gate non-login routes here by reading children path is hard —
  // each protected page checks isAdmin. Overview + CRUD pages call requireAdmin.
  return (
    <div className="min-h-screen bg-base">
      <PanelShell>{children}</PanelShell>
    </div>
  );
}

async function PanelShell({ children }: { children: React.ReactNode }) {
  const ok = await isAdmin();

  async function logout() {
    "use server";
    await clearAdminSession();
    redirect("/asu/login");
  }

  if (!ok) {
    return <div className="mx-auto max-w-md px-4 py-16">{children}</div>;
  }

  return <AdminShell logoutAction={logout}>{children}</AdminShell>;
}
