"use client";

import { useMemo, useState } from "react";

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

function parseMoney(value: string) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

export default function ProductDetailClient({ detail }: ProductDetailClientProps) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const unitPrice = useMemo(() => parseMoney(detail.price), [detail.price]);
  const totalPrice = unitPrice * quantity;

  return (
    <>
      <button type="button" className="buy-button detail-buy-button" onClick={() => setPaymentOpen(true)}>
        Thanh toán ngay
      </button>

      {paymentOpen ? (
        <div className="payment-modal-root" role="dialog" aria-modal="true" aria-label="Thanh toán sản phẩm">
          <button type="button" className="payment-modal-backdrop" aria-label="Đóng thanh toán" onClick={() => setPaymentOpen(false)} />
          <div className="payment-modal-card">
            <div className="payment-modal-head">
              <div>
                <span className="section-tag">Thanh toán</span>
                <h3>{detail.title}</h3>
              </div>
              <button type="button" className="payment-modal-close" aria-label="Đóng" onClick={() => setPaymentOpen(false)}>
                ×
              </button>
            </div>

            <div className="payment-modal-body">
              <label className="payment-modal-field">
                <span>Số lượng cần mua</span>
                <div className="payment-qty-row">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                  />
                  <button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
                </div>
              </label>

              <div className="payment-breakdown">
                <div>
                  <span>Đơn giá</span>
                  <strong>{detail.price}</strong>
                </div>
                <div>
                  <span>Số lượng</span>
                  <strong>{quantity}</strong>
                </div>
                <div>
                  <span>Tổng thanh toán</span>
                  <strong>{formatMoney(totalPrice)}</strong>
                </div>
              </div>

              <p className="payment-note">
                Popup này đang tính tổng tiền theo dữ liệu live từ sản phẩm.
                {detail.loginRequired ? " Sản phẩm nguồn hiện yêu cầu đăng nhập trước khi mua hàng thật." : ""}
              </p>

              <button type="button" className="pay-button payment-submit-button">
                Thanh toán {formatMoney(totalPrice)}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
