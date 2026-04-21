import Link from "next/link";
import { redirect } from "next/navigation";
import ThemeToggle from "../../components/ui/theme-toggle";
import { getSession } from "../../services/auth";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (session.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="checkout-page-shell">
      <div className="checkout-page-top">
        <Link href="/" className="back-link">
          ← Về trang chủ
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            👤 {session.displayName}
          </span>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              style={{ background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 8, padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.82rem" }}
            >
              Đăng xuất
            </button>
          </form>
          <ThemeToggle />
        </div>
      </div>

      <section className="checkout-hero-card">
        <div className="checkout-hero-copy">
          <span className="section-tag">Admin Panel</span>
          <h1>Quản trị FB88 MMO</h1>
          <p>
            Xem toàn bộ giao dịch nạp tiền, số dư ví người dùng, lịch sử thanh toán và thống kê hệ thống theo thời gian thực.
          </p>
        </div>
        <div className="checkout-hero-meta">
          <div><span>Tài khoản</span><strong>{session.displayName}</strong></div>
          <div><span>Quyền</span><strong style={{ color: "var(--gold)" }}>🔑 Admin</strong></div>
          <div><span>Dữ liệu</span><strong>In-memory (reset khi restart)</strong></div>
        </div>
      </section>

      <AdminClient />
    </main>
  );
}
