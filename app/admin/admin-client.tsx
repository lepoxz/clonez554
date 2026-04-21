"use client";

import { useEffect, useState } from "react";

type Deposit = {
  code: string; username: string; amount: number;
  status: "pending" | "paid" | "expired"; createdAt: string; paidAt?: string;
};
type Balance = { username: string; balance: number };
type Tx = { id: string; username: string; type: "deposit" | "payment"; amount: number; description: string; createdAt: string };
type Order = { orderCode: string; username: string; productId: string; productTitle: string; quantity: number; unitPrice: number; totalAmount: number; paidAt: string };
type Stats = { totalDeposits: number; paidDeposits: number; totalDeposited: number; totalOrders: number; totalRevenue: number; totalUsers: number; totalTransactions: number };

function fmtVnd(v: number) { return `${new Intl.NumberFormat("vi-VN").format(v)}đ`; }
function fmtDate(s: string) { return new Date(s).toLocaleString("vi-VN"); }

type Tab = "overview" | "orders" | "deposits" | "balances" | "transactions";

export default function AdminClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/stats");
      if (!r.ok) throw new Error("Forbidden");
      const d = await r.json() as { stats: Stats; deposits: Deposit[]; balances: Balance[]; transactions: Tx[]; orders: Order[] };
      setStats(d.stats); setDeposits(d.deposits); setBalances(d.balances);
      setTransactions(d.transactions); setOrders(d.orders);
    } catch { setError("Không thể tải dữ liệu admin"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: "0.45rem 1rem", borderRadius: 8, border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: "0.85rem",
    background: tab === t ? "var(--gold)" : "var(--panel-alt)",
    color: tab === t ? "#000" : "var(--muted)", transition: "all 0.15s"
  });

  const thStyle: React.CSSProperties = { padding: "0.55rem 1rem", textAlign: "left", whiteSpace: "nowrap", color: "var(--muted)", fontSize: "0.8rem" };
  const tdStyle: React.CSSProperties = { padding: "0.55rem 1rem", borderBottom: "1px solid var(--line)" };

  if (loading) return <div style={{ padding: "2rem", color: "var(--muted)" }}>Đang tải...</div>;
  if (error) return <div style={{ padding: "2rem", color: "var(--red)" }}>{error}</div>;

  return (
    <div style={{ padding: "1.5rem 0" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {(["overview", "orders", "deposits", "balances", "transactions"] as Tab[]).map((t) => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {{"overview":"📊 Tổng quan","orders":"🛒 Đơn hàng","deposits":"💳 Nạp tiền","balances":"👛 Số dư","transactions":"📋 Giao dịch"}[t]}
          </button>
        ))}
        <button onClick={loadData} style={{ marginLeft: "auto", padding: "0.45rem 0.9rem", borderRadius: 8, border: "1px solid var(--line)", background: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem" }}>
          🔄 Làm mới
        </button>
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Đơn hàng", value: stats.totalOrders, color: "var(--text)" },
            { label: "Doanh thu từ ví", value: fmtVnd(stats.totalRevenue), color: "var(--green)" },
            { label: "Lượt nạp tiền", value: stats.paidDeposits + "/" + stats.totalDeposits, color: "var(--text)" },
            { label: "Tổng tiền nạp", value: fmtVnd(stats.totalDeposited), color: "var(--gold)" },
            { label: "Người dùng", value: stats.totalUsers, color: "var(--text)" },
            { label: "Giao dịch", value: stats.totalTransactions, color: "var(--text)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "var(--panel-strong)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
              <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginBottom: "0.3rem" }}>{label}</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Đơn hàng ── */}
      {tab === "orders" && (
        <div style={{ overflowX: "auto" }}>
          {orders.length === 0
            ? <p style={{ color: "var(--muted)", padding: "2rem 0" }}>Chưa có đơn hàng nào</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead><tr style={{ background: "var(--panel-alt)" }}>
                  {["Mã đơn","User","Sản phẩm","SL","Đơn giá","Tổng","Thời gian"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.orderCode}>
                      <td style={{ ...tdStyle, fontFamily: "monospace", color: "var(--gold)", fontSize: "0.78rem" }}>{o.orderCode}</td>
                      <td style={tdStyle}>{o.username}</td>
                      <td style={{ ...tdStyle, maxWidth: 200 }}>{o.productTitle}</td>
                      <td style={tdStyle}>{o.quantity}</td>
                      <td style={tdStyle}>{fmtVnd(o.unitPrice)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: "var(--green)" }}>{fmtVnd(o.totalAmount)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(o.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* ── Nạp tiền ── */}
      {tab === "deposits" && (
        <div style={{ overflowX: "auto" }}>
          {deposits.length === 0
            ? <p style={{ color: "var(--muted)", padding: "2rem 0" }}>Chưa có giao dịch nạp tiền</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead><tr style={{ background: "var(--panel-alt)" }}>
                  {["Mã","User","Số tiền","Trạng thái","Tạo lúc","Thanh toán lúc"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {deposits.map(d => (
                    <tr key={d.code}>
                      <td style={{ ...tdStyle, fontFamily: "monospace", color: "var(--gold)", fontSize: "0.78rem" }}>{d.code}</td>
                      <td style={tdStyle}>{d.username}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{fmtVnd(d.amount)}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: "0.18rem 0.55rem", borderRadius: 20, fontSize: "0.76rem", fontWeight: 700, background: d.status === "paid" ? "rgba(111,207,151,0.15)" : "rgba(255,200,50,0.12)", color: d.status === "paid" ? "var(--green)" : "var(--gold)" }}>
                          {d.status === "paid" ? "✓ Đã TT" : "⏳ Chờ"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(d.createdAt)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{d.paidAt ? fmtDate(d.paidAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* ── Số dư ── */}
      {tab === "balances" && (
        <div style={{ overflowX: "auto" }}>
          {balances.length === 0
            ? <p style={{ color: "var(--muted)", padding: "2rem 0" }}>Chưa có ví nào</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead><tr style={{ background: "var(--panel-alt)" }}>
                  <th style={thStyle}>Username</th><th style={{ ...thStyle, textAlign: "right" }}>Số dư</th>
                </tr></thead>
                <tbody>
                  {[...balances].sort((a, b) => b.balance - a.balance).map(b => (
                    <tr key={b.username}>
                      <td style={tdStyle}>{b.username}</td>
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "var(--gold)" }}>{fmtVnd(b.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* ── Giao dịch ── */}
      {tab === "transactions" && (
        <div style={{ overflowX: "auto" }}>
          {transactions.length === 0
            ? <p style={{ color: "var(--muted)", padding: "2rem 0" }}>Chưa có giao dịch nào</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead><tr style={{ background: "var(--panel-alt)" }}>
                  {["Thời gian","User","Loại","Số tiền","Mô tả"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ ...tdStyle, color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(tx.createdAt)}</td>
                      <td style={tdStyle}>{tx.username}</td>
                      <td style={tdStyle}><span style={{ color: tx.type === "deposit" ? "var(--green)" : "var(--red)" }}>{tx.type === "deposit" ? "↓ Nạp tiền" : "↑ Mua hàng"}</span></td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: tx.amount > 0 ? "var(--green)" : "var(--red)" }}>{tx.amount > 0 ? "+" : ""}{fmtVnd(Math.abs(tx.amount))}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  );
}
