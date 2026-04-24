"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "../../components/ui/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!agreed) {
      setError("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username, password })
      });
            const data = await r.json() as { success?: boolean; ok?: boolean; error?: string };

            if (!r.ok || (!data.success && !data.ok)) {
        setError(data.error ?? "Đăng ký thất bại");
        return;
      }

      router.push("/deposit");
      router.refresh();
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page-shell">
      <div className="auth-page-top">
        <Link href="/" className="back-link">
          Quay về trang chủ
        </Link>
        <ThemeToggle />
      </div>

      <section className="auth-card auth-card-register">
        <div className="auth-copy">
          <span className="section-tag">Đăng ký</span>
          <h1>Tạo tài khoản mới</h1>
          <p>Đăng ký để nạp tiền, mua hàng và lưu lịch sử giao dịch.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Họ và tên
            <input
              type="text"
              placeholder="Nhập họ và tên"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </label>
          <label>
            Username
            <input
              type="text"
              placeholder="Chỉ dùng chữ thường, số (không dấu)"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Xác nhận mật khẩu
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật</span>
          </label>

          {error && (
            <p style={{ color: "var(--red)", fontSize: "0.88rem", margin: 0 }}>{error}</p>
          )}

          <button type="submit" className="pay-button auth-submit-button" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="auth-switch-text">
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}
