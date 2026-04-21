"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = {
  username: string;
  role: "admin" | "user";
  displayName: string;
};

function formatVnd(v: number) {
  return `${new Intl.NumberFormat("vi-VN").format(v)}đ`;
}

export default function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch session + balance
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          // Fetch balance only if logged in
          return fetch("/api/wallet/balance").then((r) => r.ok ? r.json() : null);
        }
        return null;
      })
      .then((d) => { if (d?.balance !== undefined) setBalance(d.balance); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setBalance(null);
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  // Đang load — không hiện gì để tránh flash
  if (loading) {
    return <span style={{ width: 80, height: 32, borderRadius: 8, background: "var(--panel-alt)", display: "inline-block" }} />;
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <Link href="/login" className="login-chip">Đăng nhập</Link>
        <Link href="/register" style={{
          padding: "0.35rem 0.75rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
          border: "1px solid var(--line)", color: "var(--muted)", textDecoration: "none"
        }}>
          Đăng ký
        </Link>
      </div>
    );
  }

  // Đã đăng nhập — hiện dropdown
  const initials = user.displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.3rem 0.6rem 0.3rem 0.3rem",
          borderRadius: 10, border: "1px solid var(--line-strong)",
          background: open ? "var(--panel-alt)" : "var(--panel)",
          cursor: "pointer", color: "var(--text)", transition: "all 0.15s"
        }}
      >
        {/* Avatar */}
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--gold), var(--gold-soft))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.7rem", fontWeight: 800, color: "#000", flexShrink: 0
        }}>
          {initials}
        </span>
        {/* Info */}
        <span style={{ lineHeight: 1.2, textAlign: "left" }}>
          <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.displayName}
          </span>
          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--gold)", fontWeight: 600 }}>
            {balance !== null ? formatVnd(balance) : "..."}
          </span>
        </span>
        <span style={{ fontSize: "0.65rem", color: "var(--muted)", marginLeft: 2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 9999,
          background: "var(--panel-strong)", border: "1px solid var(--line-strong)",
          borderRadius: 14, minWidth: 220, boxShadow: "var(--shadow)",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Tài khoản</div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{user.displayName}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>@{user.username}</div>
            {user.role === "admin" && (
              <span style={{ fontSize: "0.68rem", background: "rgba(215,155,59,0.2)", color: "var(--gold)", padding: "0.1rem 0.4rem", borderRadius: 6, fontWeight: 700, marginTop: 4, display: "inline-block" }}>
                🔑 Admin
              </span>
            )}
          </div>

          {/* Số dư */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--line)", background: "var(--panel-alt)" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Số dư ví</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--gold)", marginTop: 2 }}>
              {balance !== null ? formatVnd(balance) : "—"}
            </div>
            <Link
              href="/deposit"
              onClick={() => setOpen(false)}
              style={{ fontSize: "0.72rem", color: "var(--gold)", marginTop: 4, display: "inline-block", textDecoration: "none" }}
            >
              + Nạp tiền →
            </Link>
          </div>

          {/* Menu items */}
          <div style={{ padding: "0.4rem 0" }}>
            {[
              { label: "👤 Thông tin tài khoản", href: "/account" },
              { label: "🛒 Lịch sử mua hàng", href: "/account?tab=orders" },
              { label: "💳 Lịch sử nạp tiền", href: "/account?tab=deposits" },
              { label: "💰 Nạp tiền vào ví", href: "/deposit" },
              ...(user.role === "admin" ? [{ label: "⚙️ Admin Panel", href: "/admin" }] : []),
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "0.55rem 1rem",
                  fontSize: "0.84rem", color: "var(--text)", textDecoration: "none",
                  transition: "background 0.1s"
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--panel-alt)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {label}
              </Link>
            ))}

            <div style={{ borderTop: "1px solid var(--line)", marginTop: "0.3rem", paddingTop: "0.3rem" }}>
              <button
                onClick={handleLogout}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "0.55rem 1rem", fontSize: "0.84rem",
                  color: "var(--red)", background: "none", border: "none",
                  cursor: "pointer", transition: "background 0.1s"
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--panel-alt)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
