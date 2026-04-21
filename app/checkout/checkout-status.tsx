"use client";

import { useEffect, useState } from "react";

type CheckoutStatusProps = {
  amount: number;
  orderCode: string;
  pollingEnabled: boolean;
};

type PaymentState = {
  paidAt: string | null;
  pollingEnabled: boolean;
  source: "memory" | "sepay_api" | "pending";
  status: "pending" | "paid";
};

export default function CheckoutStatus({ amount, orderCode, pollingEnabled }: CheckoutStatusProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    paidAt: null,
    pollingEnabled,
    source: "pending",
    status: "pending"
  });
  const [loading, setLoading] = useState(pollingEnabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollingEnabled) {
      return;
    }

    let active = true;

    async function pollStatus() {
      try {
        const response = await fetch(`/api/sepay/status?orderCode=${encodeURIComponent(orderCode)}&amount=${amount}`, {
          cache: "no-store"
        });

        const payload = (await response.json()) as Partial<PaymentState> & { error?: string };

        if (!active) {
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error ?? "Không thể kiểm tra trạng thái thanh toán");
        }

        setPaymentState({
          paidAt: payload.paidAt ?? null,
          pollingEnabled: payload.pollingEnabled ?? pollingEnabled,
          source: payload.source ?? "pending",
          status: payload.status === "paid" ? "paid" : "pending"
        });
        setError(null);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Không thể kiểm tra trạng thái thanh toán");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    pollStatus();
    const intervalId = window.setInterval(() => {
      void pollStatus();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [amount, orderCode, pollingEnabled]);

  if (paymentState.status === "paid") {
    return (
      <div className="checkout-status-card checkout-status-card-success">
        <span className="section-tag">Đã thanh toán</span>
        <h2>Hệ thống đã xác nhận giao dịch</h2>
        <p>
          Mã đơn <strong>{orderCode}</strong> đã được đánh dấu thanh toán thành công.
          {paymentState.paidAt ? ` Ghi nhận lúc: ${paymentState.paidAt}.` : ""}
        </p>
        <p className="checkout-status-next-label">Liên hệ admin để nhận hàng:</p>
        <div className="checkout-admin-grid">
          <a href="https://zalo.me/0876277977" target="_blank" rel="noopener noreferrer" className="checkout-admin-link">
            <span className="checkout-admin-avatar">KT</span>
            <span>Admin Kim Tài</span>
          </a>
          <a href="https://zalo.me/0968617797" target="_blank" rel="noopener noreferrer" className="checkout-admin-link">
            <span className="checkout-admin-avatar">TT</span>
            <span>Admin Thiên Thanh</span>
          </a>
          <a href="https://zalo.me/0972361132" target="_blank" rel="noopener noreferrer" className="checkout-admin-link">
            <span className="checkout-admin-avatar">DĐ</span>
            <span>Admin Doanh Đặng</span>
          </a>
          <a href="https://zalo.me/0963821691" target="_blank" rel="noopener noreferrer" className="checkout-admin-link">
            <span className="checkout-admin-avatar">BN</span>
            <span>Admin Bùi Ngọc</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-status-card">
      <span className="section-tag">Trạng thái đơn hàng</span>
      <h2>{loading ? "Đang kiểm tra giao dịch" : "Chờ khách chuyển khoản"}</h2>
      <p>
        {paymentState.pollingEnabled
          ? "Trang này đang tự động kiểm tra giao dịch từ SePay mỗi 5 giây."
          : "Polling SePay API chưa bật. Sau khi cấu hình API token hoặc webhook, trạng thái sẽ được cập nhật tự động."}
      </p>
      {error ? <p className="checkout-status-error">{error}</p> : null}
      <div className="checkout-status-row">
        <span className={`api-chip ${paymentState.pollingEnabled ? "api-chip-ready" : "api-chip-fallback"}`}>
          {paymentState.pollingEnabled ? "Polling SePay bật" : "Webhook only"}
        </span>
        <span className="api-chip api-chip-loading">Mã đơn: {orderCode}</span>
      </div>
    </div>
  );
}
