import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ThemeToggle from "../../components/ui/theme-toggle";
import UserNav from "../../components/ui/user-nav";
import { getSession } from "../../services/auth";
import AccountClient from "./account-client";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/account");
  }

  return (
    <main className="checkout-page-shell">
      <div className="checkout-page-top">
        <Link href="/" className="back-link">← Trang chủ</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Suspense fallback={null}>
            <UserNav />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>

      <Suspense fallback={<div style={{ padding: "2rem", color: "var(--muted)" }}>Đang tải...</div>}>
        <AccountClient />
      </Suspense>
    </main>
  );
}
