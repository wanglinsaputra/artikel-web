import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { Alert, Card, TextLink } from "@/components/ui";
import {
  allowLoginAttempt,
  getCurrentUser,
  hashPassword,
  safeInternalPath,
  setUserSession,
} from "@/lib/auth";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/db";
import { isDisposableEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const metadata = { title: "Daftar" };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;
  const nextSafe = safeInternalPath(next);
  const user = await getCurrentUser();
  if (user) redirect(nextSafe);

  async function register(formData: FormData) {
    "use server";
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");
    const nextPath = safeInternalPath(String(formData.get("next") || "/"));
    const q = `next=${encodeURIComponent(nextPath)}`;

    if (!(await allowLoginAttempt("register", 20))) {
      redirect(`/daftar?${q}&error=Terlalu%20banyak%20percobaan.%20Coba%20lagi%20nanti.`);
    }
    if (!USERNAME_RE.test(username)) {
      redirect(`/daftar?${q}&error=Username%203-24%20karakter%20%28huruf%2Cangka%2C_%29`);
    }
    if (!email || !email.includes("@")) {
      redirect(`/daftar?${q}&error=Email%20tidak%20valid`);
    }
    if (isDisposableEmail(email)) {
      redirect(
        `/daftar?${q}&error=${encodeURIComponent(
          "Temporary email addresses are not allowed. Please use a valid email address."
        )}`
      );
    }
    if (password.length < 6) {
      redirect(`/daftar?${q}&error=Password%20min%206%20karakter`);
    }
    if (await getUserByUsername(username)) {
      redirect(`/daftar?${q}&error=Username%20sudah%20dipakai`);
    }
    if (await getUserByEmail(email)) {
      redirect(`/daftar?${q}&error=Email%20sudah%20terdaftar`);
    }

    const row = await createUser(username, email, hashPassword(password));
    await setUserSession(row.id);
    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex max-w-md px-4 py-16">
      <Card className="w-full" hover={false}>
        <Link href="/" aria-label="WangLinS" className="mb-6 inline-flex">
          <BrandLogo className="h-10 w-10" priority />
        </Link>
        <h1 className="text-[28px] font-bold text-primary">Daftar</h1>
        <p className="mt-2 text-base text-secondary">Buat akun gratis untuk buka Bansos AI hot.</p>
        {error ? <Alert className="mt-4">{error}</Alert> : null}
        <form action={register} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextSafe} />
          <label className="block text-sm text-secondary">
            Username
            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={24}
              pattern="[a-zA-Z0-9_]{3,24}"
              title="3–24 karakter: huruf, angka, underscore"
              className="field mt-1"
            />
          </label>
          <label className="block text-sm text-secondary">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field mt-1"
            />
          </label>
          <label className="block text-sm text-secondary">
            Password
            <PasswordInput name="password" autoComplete="new-password" required minLength={6} />
          </label>
          <button type="submit" className="btn-primary w-full">
            Daftar
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Sudah punya akun?{" "}
          <TextLink href={`/masuk?next=${encodeURIComponent(nextSafe)}`}>Masuk</TextLink>
        </p>
      </Card>
    </div>
  );
}
