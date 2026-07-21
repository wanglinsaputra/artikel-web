import { redirect } from "next/navigation";
import { AdminPagination } from "@/components/admin-list-controls";
import { AdminUsersDirectory } from "@/components/admin-users-directory";
import { PasswordInput } from "@/components/password-input";
import { Alert, Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_PAGE_SIZE, clampAdminPage } from "@/lib/admin-query";
import { hashPassword } from "@/lib/auth";
import {
  countUsers,
  createUser,
  deleteUser,
  getUserByEmail,
  getUserByUsername,
  listUsers,
  setUserActive,
  setUserRole,
  updateUserPassword,
  type UserRole,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel Users" };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

function err(msg: string) {
  return `/asu/users?error=${encodeURIComponent(msg)}`;
}

function ok(msg: string) {
  return `/asu/users?ok=${encodeURIComponent(msg)}`;
}

type Sp = {
  error?: string;
  ok?: string;
  page?: string;
  q?: string;
  sort?: string;
  role?: string;
  active?: string;
};

function parseUsersQuery(sp: Sp) {
  const pageRaw = Number(sp.page);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  const q = String(sp.q || "").trim();
  const sort =
    sp.sort === "oldest" || sp.sort === "title" || sp.sort === "newest" ? sp.sort : "id";
  const role = sp.role === "admin" || sp.role === "user" ? sp.role : "all";
  const active =
    sp.active === "active" || sp.active === "inactive" ? sp.active : "all";
  return { page, q, sort, role, active } as const;
}

export default async function PanelUsersPage({
  searchParams,
}: {
  searchParams: Promise<Sp>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { error, ok: success } = sp;
  const query = parseUsersQuery(sp);
  const listOpts = {
    q: query.q || undefined,
    sort: query.sort,
    role: query.role,
    active: query.active,
  };
  const [total, activeCount, adminCount, totalAll] = await Promise.all([
    countUsers(listOpts),
    countUsers({ active: "active" }),
    countUsers({ role: "admin" }),
    countUsers(),
  ]);
  const page = clampAdminPage(query.page, total);
  const usersRaw = await listUsers({
    ...listOpts,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    limit: ADMIN_PAGE_SIZE,
  });
  // Never pass password_hash into client components (RSC serialization leak).
  const users = usersRaw.map(({ password_hash: _ph, ...u }) => u);

  async function createUserAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "user") === "admin" ? "admin" : "user";

    if (!USERNAME_RE.test(username)) redirect(err("Username 3-24 karakter (huruf, angka, _)"));
    if (!email || !email.includes("@")) redirect(err("Email tidak valid"));
    if (password.length < 6) redirect(err("Password min 6 karakter"));
    if (await getUserByUsername(username)) redirect(err("Username sudah dipakai"));
    if (await getUserByEmail(email)) redirect(err("Email sudah terdaftar"));

    await createUser(username, email, hashPassword(password), { role: role as UserRole });
    redirect(ok("User ditambahkan"));
  }

  async function updatePasswordAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    const password = String(formData.get("password") || "");
    if (!id || password.length < 6) redirect(err("Password min 6 karakter"));
    await updateUserPassword(id, hashPassword(password));
    redirect(ok("Password diubah"));
  }

  async function toggleActiveAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    const active = Number(formData.get("active")) ? 0 : 1;
    if (!id) redirect("/asu/users");
    await setUserActive(id, active);
    redirect(ok(active ? "Akun diaktifkan" : "Akun dinonaktifkan"));
  }

  async function setRoleAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    const role = String(formData.get("role") || "user") === "admin" ? "admin" : "user";
    if (!id) redirect("/asu/users");
    await setUserRole(id, role);
    redirect(ok("Role diubah"));
  }

  async function deleteUserAction(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = Number(formData.get("id"));
    if (!id) redirect("/asu/users");
    await deleteUser(id);
    redirect(ok("Akun dihapus"));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Users"
          description="Kelola akun: tambah, password, role, aktif, hapus."
        />
        <dl className="grid grid-cols-3 gap-2 sm:min-w-70">
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Total</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-primary">{totalAll}</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Aktif</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-primary">{activeCount}</dd>
          </div>
          <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-center">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Admin</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-primary">{adminCount}</dd>
          </div>
        </dl>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <Card hover={false} className="p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-lg font-semibold text-primary">Tambah user</h2>
          <p className="text-[13px] text-muted">Username 3–24 · password min 6</p>
        </div>
        <form action={createUserAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="new-username" className="block text-[13px] font-medium text-secondary">
              Username
            </label>
            <input
              id="new-username"
              name="username"
              placeholder="contoh_user"
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_]{3,24}"
              autoComplete="username"
              className="field min-h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-email" className="block text-[13px] font-medium text-secondary">
              Email
            </label>
            <input
              id="new-email"
              name="email"
              type="email"
              placeholder="user@email.com"
              required
              autoComplete="email"
              className="field min-h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-[13px] font-medium text-secondary">
              Password
            </label>
            <PasswordInput
              id="new-password"
              name="password"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="Min. 6 karakter"
              className="mt-0! min-h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="new-role" className="block text-[13px] font-medium text-secondary">
              Role
            </label>
            <select id="new-role" name="role" defaultValue="user" className="field min-h-11">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full min-h-11 sm:w-auto">
              Tambah User
            </button>
          </div>
        </form>
      </Card>

      <section aria-labelledby="users-list-heading" className="space-y-4">
        <h2 id="users-list-heading" className="text-lg font-semibold text-primary">
          Daftar user
        </h2>

        <form method="get" action="/asu/users" className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="min-w-0">
            <label htmlFor="users-q" className="sr-only">
              Cari user
            </label>
            <input
              id="users-q"
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="Cari username, email, ID…"
              className="field min-h-11"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="users-sort" className="sr-only">
              Urutkan
            </label>
            <select id="users-sort" name="sort" defaultValue={query.sort} className="field min-h-11">
              <option value="id">ID terbaru</option>
              <option value="newest">Dibuat terbaru</option>
              <option value="oldest">Dibuat terlama</option>
              <option value="title">Username A–Z</option>
            </select>
          </div>
          <div>
            <label htmlFor="users-role" className="sr-only">
              Role
            </label>
            <select id="users-role" name="role" defaultValue={query.role} className="field min-h-11">
              <option value="all">Semua role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label htmlFor="users-active" className="sr-only">
              Status
            </label>
            <select id="users-active" name="active" defaultValue={query.active} className="field min-h-11">
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          <button type="submit" className="btn-primary min-h-11 w-full sm:w-auto">
            Terapkan
          </button>
        </form>
        <p className="text-[13px] text-muted" aria-live="polite">
          {total === 0
            ? "0 hasil"
            : `Menampilkan ${(page - 1) * ADMIN_PAGE_SIZE + 1}–${Math.min(page * ADMIN_PAGE_SIZE, total)} dari ${total}`}
        </p>

        <AdminUsersDirectory
          users={users}
          emptyText={
            query.q || query.role !== "all" || query.active !== "all"
              ? "Tidak ada user yang cocok."
              : "Belum ada user."
          }
          updatePasswordAction={updatePasswordAction}
          toggleActiveAction={toggleActiveAction}
          setRoleAction={setRoleAction}
          deleteUserAction={deleteUserAction}
        />

        <AdminPagination
          basePath="/asu/users"
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
          total={total}
          q={query.q}
          sort={query.sort}
          status="all"
          extra={{ role: query.role, active: query.active }}
        />
      </section>
    </div>
  );
}
