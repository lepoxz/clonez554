"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import ThemeToggle from "../../components/ui/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await r.json() as { success: boolean; error?: string };

      if (!r.ok || !data.success) {
        setError(data.error ?? "Đăng nhập thất bại");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Username
        <input
          type="text"
          placeholder="Nhập username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>

      {error && (
        <p style={{ color: "var(--red)", fontSize: "0.88rem", margin: 0 }}>{error}</p>
      )}

      <button type="submit" className="pay-button auth-submit-button" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div style={{ background: "var(--panel-alt)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.82rem", color: "var(--muted)", border: "1px solid var(--line)" }}>
        <strong style={{ color: "var(--gold)" }}>🔑 Tài khoản Admin Demo</strong><br />
        Username: <code style={{ color: "var(--text)" }}>admin</code> &nbsp;|&nbsp; Password: <code style={{ color: "var(--text)" }}>admin@fb88demo</code>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page-shell">
      <div className="auth-page-top">
        <Link href="/" className="back-link">
          Quay về trang chủ
        </Link>
        <ThemeToggle />
      </div>

      <section className="auth-card">
        <div className="auth-copy">
          <span className="section-tag">Đăng nhập</span>
          <h1>Truy cập tài khoản FB88 MMO</h1>
          <p>Đăng nhập để nạp tiền, quản lý đơn hàng và theo dõi giao dịch.</p>
        </div>

        <Suspense fallback={<div style={{ color: "var(--muted)" }}>Đang tải...</div>}>
          <LoginForm />
        </Suspense>

        <p className="auth-switch-text">
          Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
        </p>
      </section>
    </main>
  );
}
