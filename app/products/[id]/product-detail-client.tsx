"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductDetailClientProps = {
  detail: {
    buyButtonLabel: string | null;
    desc: string;
    favoriteAvailable: boolean;
    id: string;
    loginRequired: boolean;
    price: string;
    previewSupported: boolean;
    stock: string;
    title: string;
  };
};

type PurchasedOrder = {
  orderCode: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAt: string;
};

function parseMoney(value: string) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

type ModalStep = "confirm" | "success" | "error";

export default function ProductDetailClient({ detail }: ProductDetailClientProps) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<ModalStep>("confirm");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<PurchasedOrder | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [user, setUser] = useState<{ username: string; displayName: string } | null>(null);

  const unitPrice = useMemo(() => parseMoney(detail.price), [detail.price]);
  const totalPrice = unitPrice * quantity;

  // Lấy thông tin user + số dư khi mở modal
  useEffect(() => {
    if (!paymentOpen) return;
    setStep("confirm");
    setError("");
    setOrder(null);

    // Lấy session
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user) setUser(d.user); })
      .catch(() => {});

    // Lấy số dư
    fetch("/api/wallet/balance")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.balance !== undefined) setBalance(d.balance); })
      .catch(() => {});
  }, [paymentOpen]);

  function handleOpen() {
    setQuantity(1);
    setPaymentOpen(true);
  }

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/wallet/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: detail.id,
          productTitle: detail.title,
          quantity,
          unitPrice
        })
      });
      const data = await r.json() as {
        success: boolean;
        error?: string;
        order?: PurchasedOrder;
        balance?: number;
      };

      if (!r.ok || !data.success) {
        setError(data.error ?? "Thanh toán thất bại");
        if (r.status === 402) setStep("error");
        return;
      }

      setOrder(data.order ?? null);
      setNewBalance(data.balance ?? null);
      setStep("success");
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }

  const isLoggedIn = !!user;
  const hasEnough = balance !== null && balance >= totalPrice;

  return (
    <>
      <button type="button" className="buy-button detail-buy-button" onClick={handleOpen}>
        Mua ngay
      </button>

      {paymentOpen && (
        <div className="payment-modal-root" role="dialog" aria-modal="true" aria-label="Thanh toán sản phẩm">
          <button type="button" className="payment-modal-backdrop" aria-label="Đóng" onClick={() => setPaymentOpen(false)} />
          <div className="payment-modal-card">

            {/* Header */}
            <div className="payment-modal-head">
              <div>
                <span className="section-tag">
                  {step === "success" ? "Đặt hàng thành công" : step === "error" ? "Không đủ số dư" : "Thanh toán từ ví"}
                </span>
                <h3>{detail.title}</h3>
              </div>
              <button type="button" className="payment-modal-close" aria-label="Đóng" onClick={() => setPaymentOpen(false)}>×</button>
            </div>

            <div className="payment-modal-body">

              {/* ── Bước xác nhận ── */}
              {step === "confirm" && (
                <>
                  {/* Số lượng */}
                  <label className="payment-modal-field">
                    <span>Số lượng</span>
                    <div className="payment-qty-row">
                      <button type="button" onClick={() => setQuantity((v) => Math.max(1, v - 1))}>-</button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      />
                      <button type="button" onClick={() => setQuantity((v) => v + 1)}>+</button>
                    </div>
                  </label>

                  {/* Bảng tính tiền */}
                  <div className="payment-breakdown">
                    <div><span>Đơn giá</span><strong>{detail.price}</strong></div>
                    <div><span>Số lượng</span><strong>{quantity}</strong></div>
                    <div><span>Tổng thanh toán</span><strong style={{ color: "var(--gold)" }}>{formatMoney(totalPrice)}</strong></div>
                  </div>

                  {/* Số dư ví */}
                  <div style={{
                    margin: "1rem 0 0.5rem",
                    padding: "0.75rem 1rem",
                    background: "var(--panel-alt)",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    fontSize: "0.88rem"
                  }}>
                    <span style={{ color: "var(--muted)" }}>Số dư ví: </span>
                    {balance !== null
                      ? <strong style={{ color: hasEnough ? "var(--green)" : "var(--red)" }}>{formatMoney(balance)}</strong>
                      : <span style={{ color: "var(--muted)" }}>Đang tải...</span>}
                    {balance !== null && !hasEnough && (
                      <span style={{ color: "var(--red)", display: "block", marginTop: "0.3rem", fontSize: "0.8rem" }}>
                        Thiếu {formatMoney(totalPrice - balance)} — <Link href="/deposit" style={{ color: "var(--gold)" }}>Nạp tiền ngay</Link>
                      </span>
                    )}
                  </div>

                  {error && <p style={{ color: "var(--red)", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{error}</p>}

                  {/* Nút hành động */}
                  {!isLoggedIn ? (
                    <Link href="/login" className="pay-button payment-submit-button" style={{ display: "block", textAlign: "center" }}>
                      Đăng nhập để mua hàng
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="pay-button payment-submit-button"
                      onClick={handlePay}
                      disabled={loading || !hasEnough}
                      style={{ opacity: loading || !hasEnough ? 0.6 : 1 }}
                    >
                      {loading ? "Đang xử lý..." : `Thanh toán ${formatMoney(totalPrice)} từ ví`}
                    </button>
                  )}

                  <p className="payment-note" style={{ marginTop: "0.75rem" }}>
                    Tiền sẽ bị trừ ngay khỏi ví. Sau khi đặt hàng, liên hệ admin để nhận sản phẩm.
                  </p>
                </>
              )}

              {/* ── Thành công ── */}
              {step === "success" && order && (
                <>
                  <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "2.5rem" }}>✅</div>
                    <p style={{ color: "var(--green)", fontWeight: 700, fontSize: "1.1rem", margin: "0.5rem 0" }}>
                      Đặt hàng thành công!
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Mã đơn: <strong style={{ color: "var(--gold)", fontFamily: "monospace" }}>{order.orderCode}</strong></p>
                  </div>

                  <div className="payment-breakdown">
                    <div><span>Sản phẩm</span><strong>{order.productTitle}</strong></div>
                    <div><span>Số lượng</span><strong>{order.quantity}</strong></div>
                    <div><span>Đã thanh toán</span><strong style={{ color: "var(--red)" }}>-{formatMoney(order.totalAmount)}</strong></div>
                    {newBalance !== null && (
                      <div><span>Số dư còn lại</span><strong style={{ color: "var(--gold)" }}>{formatMoney(newBalance)}</strong></div>
                    )}
                  </div>

                  <p style={{ margin: "1rem 0 0.5rem", fontWeight: 600, fontSize: "0.88rem", color: "var(--muted)" }}>
                    Liên hệ admin để nhận sản phẩm:
                  </p>
                  <div className="checkout-admin-grid">
                    {[
                      { name: "Admin Kim Tài", zalo: "0876277977", initials: "KT" },
                      { name: "Admin Thiên Thanh", zalo: "0968617797", initials: "TT" },
                      { name: "Admin Doanh Đặng", zalo: "0972361132", initials: "DĐ" },
                      { name: "Admin Bùi Ngọc", zalo: "0963821691", initials: "BN" }
                    ].map(({ name, zalo, initials }) => (
                      <a key={zalo} href={`https://zalo.me/${zalo}`} target="_blank" rel="noopener noreferrer" className="checkout-admin-link">
                        <span className="checkout-admin-avatar">{initials}</span>
                        <span>{name}</span>
                      </a>
                    ))}
                  </div>
                </>
              )}

              {/* ── Lỗi không đủ tiền ── */}
              {step === "error" && (
                <>
                  <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "2.5rem" }}>💳</div>
                    <p style={{ color: "var(--red)", fontWeight: 700, margin: "0.5rem 0" }}>Số dư không đủ</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{error}</p>
                  </div>
                  <Link href="/deposit" className="pay-button payment-submit-button" style={{ display: "block", textAlign: "center" }}>
                    Nạp tiền vào ví ngay
                  </Link>
                  <button
                    type="button"
                    style={{ display: "block", width: "100%", marginTop: "0.5rem", background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 8, padding: "0.5rem", cursor: "pointer" }}
                    onClick={() => setStep("confirm")}
                  >
                    Quay lại
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
