import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordInput } from "@/components/password-input";
import { Alert, Card } from "@/components/ui";
import {
  allowLoginAttempt,
  checkAdminPassword,
  isAdmin,
  setAdminSession,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/asu");
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    if (!(await allowLoginAttempt("admin-login", 8))) {
      redirect("/asu/login?error=Terlalu%20banyak%20percobaan.%20Coba%20lagi%20nanti.");
    }
    const password = String(formData.get("password") || "");
    if (!checkAdminPassword(password)) {
      redirect("/asu/login?error=Password%20salah");
    }
    await setAdminSession();
    redirect("/asu");
  }

  return (
    <Card className="w-full" hover={false}>
      <Link href="/" aria-label="WangLinS" className="mb-6 inline-flex">
        <BrandLogo className="h-10 w-10" priority />
      </Link>
      <h1 className="text-[28px] font-bold text-primary">Login</h1>
      <p className="mt-2 text-base text-secondary">Akses panel konten.</p>
      {error ? <Alert className="mt-4">{error}</Alert> : null}
      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm text-secondary">
          Password
          <PasswordInput name="password" required />
        </label>
        <button type="submit" className="btn-primary w-full">
          Masuk
        </button>
      </form>
    </Card>
  );
}
