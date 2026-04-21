"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Order = { orderCode: string; productTitle: string; quantity: number; unitPrice: number; totalAmount: number; paidAt: string };
type Deposit = { code: string; amount: number; status: "pending" | "paid" | "expired"; createdAt: string; paidAt?: string };
type Tx = { id: string; type: "deposit" | "payment"; amount: number; description: string; createdAt: string };
type User = { username: string; displayName: string; role: string };

function fmtVnd(v: number) { return `${new Intl.NumberFormat("vi-VN").format(Math.abs(v))}đ`; }
function fmtDate(s: string) { return new Date(s).toLocaleString("vi-VN"); }

type Tab = "overview" | "orders" | "deposits";

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") ?? "overview") as Tab;
  const [tab, setTab] = useState<Tab>(initialTab);

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);

  useEffect(() => {
    fetch("/api/wallet/orders")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        setBalance(d.balance ?? 0);
        setUser(d.user ?? null);
        setOrders(d.orders ?? []);
        setDeposits(d.deposits ?? []);
        setTransactions(d.transactions ?? []);
      })
      .catch(() => router.push("/login?redirect=/account"))
      .finally(() => setLoading(false));
  }, [router]);

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "0.5rem 1.1rem", borderRadius: 8, border: "none",
    cursor: "pointer", fontWeight: 600, fontSize: "0.86rem",
    background: tab === t ? "var(--gold)" : "var(--panel-alt)",
    color: tab === t ? "#000" : "var(--muted)", transition: "all 0.15s"
  });

  const thStyle: React.CSSProperties = { padding: "0.5rem 1rem", textAlign: "left", color: "var(--muted)", fontSize: "0.78rem", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "0.55rem 1rem", borderBottom: "1px solid var(--line)", fontSize: "0.85rem" };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>Đang tải...</div>;

  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalDeposited = deposits.filter(d => d.status === "paid").reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      {/* Profile hero */}
      <section className="checkout-hero-card" style={{ marginBottom: "1.5rem" }}>
        <div className="checkout-hero-copy">
          <span className="section-tag">Tài khoản của tôi</span>
          <h1 style={{ fontSize: "1.6rem" }}>{user?.displayName}</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>@{user?.username} · {user?.role === "admin" ? "🔑 Admin" : "👤 Thành viên"}</p>
        </div>
        <div className="checkout-hero-meta">
          <div><span>Số dư ví</span><strong style={{ color: "var(--gold)" }}>{fmtVnd(balance)}</strong></div>
          <div><span>Tổng nạp</span><strong>{fmtVnd(totalDeposited)}</strong></div>
          <div><span>Đơn hàng</span><strong>{orders.length}</strong></div>
          <div><span>Tổng chi</span><strong>{fmtVnd(totalSpent)}</strong></div>
        </div>
      </section>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/deposit" className="pay-button" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
          💳 Nạp tiền vào ví
        </Link>
        <Link href="/" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderRadius: 8, border: "1px solid var(--line)", color: "var(--muted)", textDecoration: "none" }}>
          🛍️ Tiếp tục mua hàng
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem" }}>
        <button style={tabStyle("overview")} onClick={() => setTab("overview")}>📊 Tổng quan</button>
        <button style={tabStyle("orders")} onClick={() => setTab("orders")}>🛒 Lịch sử mua ({orders.length})</button>
        <button style={tabStyle("deposits")} onClick={() => setTab("deposits")}>💳 Lịch sử nạp ({deposits.length})</button>
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div>
          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Số dư hiện tại", value: fmtVnd(balance), color: "var(--gold)" },
              { label: "Tổng đã nạp", value: fmtVnd(totalDeposited), color: "var(--green)" },
              { label: "Tổng đã chi", value: fmtVnd(totalSpent), color: "var(--red)" },
              { label: "Số đơn hàng", value: String(orders.length), color: "var(--text)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--panel-strong)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.1rem" }}>
                <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginBottom: "0.3rem" }}>{label}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Recent transactions */}
          <div style={{ background: "var(--panel-strong)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "0.85rem 1.1rem", borderBottom: "1px solid var(--line)", fontWeight: 700, fontSize: "0.88rem" }}>
              Giao dịch gần đây
            </div>
            {transactions.length === 0
              ? <p style={{ padding: "1.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>Chưa có giao dịch nào</p>
              : transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 1.1rem", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontSize: "0.84rem" }}>{tx.description}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: 2 }}>{fmtDate(tx.createdAt)}</div>
                    </div>
                    <strong style={{ color: tx.amount > 0 ? "var(--green)" : "var(--red)", fontSize: "0.9rem", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                      {tx.amount > 0 ? "+" : "-"}{fmtVnd(tx.amount)}
                    </strong>
                  </div>
                ))
            }
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      {tab === "orders" && (
        <div style={{ overflowX: "auto" }}>
          {orders.length === 0
            ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>Bạn chưa có đơn hàng nào</p>
                <Link href="/" className="pay-button" style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}>Khám phá sản phẩm</Link>
              </div>
            )
            : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "var(--panel-alt)" }}>
                  {["Mã đơn", "Sản phẩm", "SL", "Đơn giá", "Tổng", "Thời gian"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderCode}>
                      <td style={{ ...tdStyle, fontFamily: "monospace", color: "var(--gold)", fontSize: "0.75rem" }}>{o.orderCode}</td>
                      <td style={{ ...tdStyle, maxWidth: 200 }}>{o.productTitle}</td>
                      <td style={tdStyle}>{o.quantity}</td>
                      <td style={tdStyle}>{fmtVnd(o.unitPrice)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: "var(--red)" }}>{fmtVnd(o.totalAmount)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(o.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      {/* ── Deposits ── */}
      {tab === "deposits" && (
        <div style={{ overflowX: "auto" }}>
          {deposits.length === 0
            ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>Chưa có lần nạp tiền nào</p>
                <Link href="/deposit" className="pay-button" style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}>Nạp tiền ngay</Link>
              </div>
            )
            : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "var(--panel-alt)" }}>
                  {["Mã nạp", "Số tiền", "Trạng thái", "Tạo lúc", "Thanh toán lúc"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.code}>
                      <td style={{ ...tdStyle, fontFamily: "monospace", color: "var(--gold)", fontSize: "0.75rem" }}>{d.code}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtVnd(d.amount)}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: "0.15rem 0.5rem", borderRadius: 20, fontSize: "0.74rem", fontWeight: 700, background: d.status === "paid" ? "rgba(111,207,151,0.15)" : "rgba(255,200,50,0.12)", color: d.status === "paid" ? "var(--green)" : "var(--gold)" }}>
                          {d.status === "paid" ? "✓ Đã nhận" : "⏳ Chờ TT"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(d.createdAt)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{d.paidAt ? fmtDate(d.paidAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}
    </div>
  );
}
