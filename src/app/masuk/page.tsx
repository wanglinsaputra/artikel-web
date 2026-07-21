import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { Alert, Card, TextLink } from "@/components/ui";
import {
  allowLoginAttempt,
  getCurrentUser,
  safeInternalPath,
  setUserSession,
  verifyPassword,
} from "@/lib/auth";
import { getUserByLogin } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Masuk" };

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;
  const nextSafe = safeInternalPath(next);
  const user = await getCurrentUser();
  if (user) redirect(nextSafe);

  async function login(formData: FormData) {
    "use server";
    const loginId = String(formData.get("login") || "").trim();
    const password = String(formData.get("password") || "");
    const nextPath = safeInternalPath(String(formData.get("next") || "/"));
    if (!(await allowLoginAttempt("user-login"))) {
      redirect(
        `/masuk?next=${encodeURIComponent(nextPath)}&error=Terlalu%20banyak%20percobaan.%20Coba%20lagi%20nanti.`
      );
    }
    const row = await getUserByLogin(loginId);
    if (!row || !verifyPassword(password, row.password_hash)) {
      redirect(
        `/masuk?next=${encodeURIComponent(nextPath)}&error=Username%2Femail%20atau%20password%20salah`
      );
    }
    if (row.active === 0) {
      redirect(
        `/masuk?next=${encodeURIComponent(nextPath)}&error=Akun%20nonaktif.%20Hubungi%20admin.`
      );
    }
    await setUserSession(row.id);
    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex max-w-md px-4 py-16">
      <Card className="w-full" hover={false}>
        <Link href="/" aria-label="WangLinS" className="mb-6 inline-flex">
          <BrandLogo className="h-10 w-10" priority />
        </Link>
        <h1 className="text-[28px] font-bold text-primary">Masuk</h1>
        <p className="mt-2 text-base text-secondary">Login untuk buka Bansos AI hot.</p>
        {error ? <Alert className="mt-4">{error}</Alert> : null}
        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextSafe} />
          <label className="block text-sm text-secondary">
            Username / Email
            <input
              name="login"
              type="text"
              autoComplete="username"
              required
              className="field mt-1"
            />
          </label>
          <label className="block text-sm text-secondary">
            Password
            <PasswordInput name="password" autoComplete="current-password" required />
          </label>
          <button type="submit" className="btn-primary w-full">
            Masuk
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Belum punya akun?{" "}
          <TextLink href={`/daftar?next=${encodeURIComponent(nextSafe)}`}>Daftar</TextLink>
        </p>
      </Card>
    </div>
  );
}
