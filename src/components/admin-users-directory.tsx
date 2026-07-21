"use client";

import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Badge, EmptyState } from "@/components/ui";
import type { User } from "@/lib/db";

/** Public user fields only — never include password_hash. */
export type AdminUserRow = Omit<User, "password_hash">;

type Props = {
  users: AdminUserRow[];
  emptyText?: string;
  updatePasswordAction: (formData: FormData) => void | Promise<void>;
  toggleActiveAction: (formData: FormData) => void | Promise<void>;
  setRoleAction: (formData: FormData) => void | Promise<void>;
  deleteUserAction: (formData: FormData) => void | Promise<void>;
};

function UserActions({
  u,
  updatePasswordAction,
  toggleActiveAction,
  setRoleAction,
  deleteUserAction,
}: {
  u: AdminUserRow;
  updatePasswordAction: Props["updatePasswordAction"];
  toggleActiveAction: Props["toggleActiveAction"];
  setRoleAction: Props["setRoleAction"];
  deleteUserAction: Props["deleteUserAction"];
}) {
  return (
    <div className="flex flex-col gap-3">
      <form action={setRoleAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={u.id} />
        <label className="sr-only" htmlFor={`role-${u.id}`}>
          Role {u.username || u.email}
        </label>
        <select
          id={`role-${u.id}`}
          name="role"
          defaultValue={u.role}
          className="field min-h-10 w-auto min-w-28 py-2 text-sm"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-ghost min-h-10 px-3.5" aria-label={`Simpan role ${u.username || u.email}`}>
          Simpan role
        </button>
      </form>

      <form action={updatePasswordAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={u.id} />
        <label className="sr-only" htmlFor={`pw-${u.id}`}>
          Password baru {u.username || u.email}
        </label>
        <input
          id={`pw-${u.id}`}
          name="password"
          type="password"
          minLength={6}
          required
          placeholder="Password baru"
          autoComplete="new-password"
          className="field min-h-10 w-full min-w-0 sm:w-44"
        />
        <button
          type="submit"
          className="btn-ghost min-h-10 px-3.5"
          aria-label={`Ubah password ${u.username || u.email}`}
        >
          Edit password
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <form action={toggleActiveAction}>
          <input type="hidden" name="id" value={u.id} />
          <input type="hidden" name="active" value={u.active} />
          <button
            type="submit"
            className="btn-ghost min-h-10 px-3.5"
            aria-label={
              u.active
                ? `Nonaktifkan ${u.username || u.email}`
                : `Aktifkan ${u.username || u.email}`
            }
          >
            {u.active ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
        <ConfirmDeleteButton
          action={deleteUserAction}
          id={u.id}
          label="Hapus"
          message={`Yakin hapus akun ${u.username || u.email}? Tidak bisa dibatalkan.`}
        />
      </div>
    </div>
  );
}

export function AdminUsersDirectory({
  users,
  emptyText = "Belum ada user.",
  updatePasswordAction,
  toggleActiveAction,
  setRoleAction,
  deleteUserAction,
}: Props) {
  if (users.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="space-y-4">
      {/* Mobile: stacked cards */}
      <ul className="space-y-3 md:hidden" aria-label="Daftar user">
        {users.map((u) => (
          <li
            key={u.id}
            className="rounded-2xl border border-border bg-surface p-4 shadow-(--shadow-sm)"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-primary">
                  {u.username || "—"}
                </p>
                <p className="mt-0.5 truncate text-sm text-secondary" title={u.email}>
                  {u.email}
                </p>
                <p className="mt-1 text-[13px] text-muted">
                  ID {u.id} · {u.created_at.slice(0, 10)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge tone={u.active ? "default" : "hot"}>
                  {u.active ? "Aktif" : "Nonaktif"}
                </Badge>
                <Badge tone={u.role === "admin" ? "lock" : "default"}>
                  {u.role === "admin" ? "Admin" : "User"}
                </Badge>
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <UserActions
                u={u}
                updatePasswordAction={updatePasswordAction}
                toggleActiveAction={toggleActiveAction}
                setRoleAction={setRoleAction}
                deleteUserAction={deleteUserAction}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: sticky-header table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <div className="max-h-[min(70vh,720px)] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-elevated/95 text-[13px] text-muted backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  User
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Role
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                  Dibuat
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="align-top border-b border-border last:border-0 hover:bg-surface-hover/50"
                >
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-primary">{u.username || "—"}</p>
                      <p className="mt-0.5 max-w-xs truncate text-secondary" title={u.email}>
                        {u.email}
                      </p>
                      <p className="mt-1 text-[12px] text-muted">ID {u.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={u.active ? "default" : "hot"}>
                      {u.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={u.role === "admin" ? "lock" : "default"}>
                      {u.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-[13px] text-muted">
                    {u.created_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-4">
                    <UserActions
                      u={u}
                      updatePasswordAction={updatePasswordAction}
                      toggleActiveAction={toggleActiveAction}
                      setRoleAction={setRoleAction}
                      deleteUserAction={deleteUserAction}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
