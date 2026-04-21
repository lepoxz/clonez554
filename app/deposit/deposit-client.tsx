"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type DepositRecord = {
  code: string;
  username: string;
  amount: number;
  status: "pending" | "paid" | "expired";
  createdAt: string;
  paidAt?: string;
};

type Step = "form" | "qr" | "success";

function formatVnd(v: number) {
  return `${new Intl.NumberFormat("vi-VN").format(v)}đ`;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function DepositClient() {
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deposit, setDeposit] = useState<DepositRecord | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch current balance
  useEffect(() => {
    fetch("/api/wallet/balance")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.balance !== undefined) setBalance(d.balance); })
      .catch(() => {});
  }, [step]);

  // Polling khi đang ở bước QR
  useEffect(() => {
    if (step !== "qr" || !deposit) return;

    const poll = async () => {
      try {
        const r = await fetch(`/api/wallet/deposit/status?code=${deposit.code}`);
        if (!r.ok) return;
        const data = await r.json() as { deposit: DepositRecord };
        if (data.deposit?.status === "paid") {
          setDeposit(data.deposit);
          setBalance((prev) => (prev ?? 0) + data.deposit.amount);
          setStep("success");
        }
      } catch {}
    };

    poll();
    pollRef.current = setInterval(poll, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, deposit]);

  function handleCopy(value: string, key: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const num = Number(amount.replace(/[^\d]/g, ""));
    if (!num || num < 10000) {
      setError("Số tiền tối thiểu là 10.000đ");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/wallet/deposit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num })
      });
      const data = await r.json() as {
        deposit?: DepositRecord;
        qrUrl?: string | null;
        checkoutReady?: boolean;
        error?: string;
      };

      if (!r.ok || !data.deposit) {
        setError(data.error ?? "Lỗi tạo giao dịch");
        return;
      }

      setDeposit(data.deposit);
      setQrUrl(data.qrUrl ?? null);
      setCheckoutReady(data.checkoutReady ?? false);
      setStep("qr");
    } catch {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }

  // ─── Step: Form ──────────────────────────────────────────────────────────────
  if (step === "form") {
    return (
      <section className="checkout-grid" style={{ marginTop: "2rem" }}>
        <article className="checkout-panel" style={{ maxWidth: 480, margin: "0 auto" }}>
          <span className="section-tag">Nạp tiền ví</span>
          <h2>Chọn số tiền nạp</h2>

          {balance !== null && (
            <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--panel-alt)", borderRadius: 10, border: "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Số dư hiện tại: </span>
              <strong style={{ color: "var(--gold)" }}>{formatVnd(balance)}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {PRESET_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: amount === String(v) ? "1.5px solid var(--gold)" : "1px solid var(--line)",
                    background: amount === String(v) ? "rgba(215,155,59,0.12)" : "var(--panel-alt)",
                    color: amount === String(v) ? "var(--gold)" : "var(--text)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600
                  }}
                >
                  {formatVnd(v)}
                </button>
              ))}
            </div>

            <label>
              Hoặc nhập số tiền khác
              <input
                type="text"
                placeholder="Ví dụ: 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
              />
            </label>

            {error && (
              <p style={{ color: "var(--red)", fontSize: "0.9rem", margin: 0 }}>{error}</p>
            )}

            <button type="submit" className="pay-button auth-submit-button" disabled={loading}>
              {loading ? "Đang tạo QR..." : "Tạo mã QR nạp tiền"}
            </button>
          </form>

          <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--muted)", textAlign: "center" }}>
            Tối thiểu 10.000đ · Tối đa 50.000.000đ · Tự động cộng vào ví sau khi chuyển khoản
          </p>
        </article>
      </section>
    );
  }

  // ─── Step: QR ────────────────────────────────────────────────────────────────
  if (step === "qr" && deposit) {
    return (
      <section className="checkout-grid">
        <article className="checkout-panel checkout-panel-qr">
          <span className="section-tag">Quét QR nạp tiền</span>
          <h2>Chuyển khoản {formatVnd(deposit.amount)}</h2>

          {checkoutReady && qrUrl ? (
            <>
              <div className="checkout-qr-frame">
                <Image src={qrUrl} alt="QR nạp tiền" className="checkout-qr-image" width={360} height={360} unoptimized />
              </div>
              <p className="checkout-hint">
                Quét bằng app ngân hàng. Số tiền <strong>{formatVnd(deposit.amount)}</strong>, nội dung chuyển khoản: <strong>{deposit.code}</strong>
              </p>
            </>
          ) : (
            <div className="checkout-config-warning">
              <strong>Chưa cấu hình SePay QR.</strong>
              <p>Vui lòng điền đầy đủ SEPAY_BANK, SEPAY_ACCOUNT_NUMBER, SEPAY_ACCOUNT_NAME vào .env.local</p>
            </div>
          )}

          <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            Đang chờ xác nhận thanh toán...
          </div>
        </article>

        <article className="checkout-panel checkout-panel-summary">
          <span className="section-tag">Thông tin chuyển khoản</span>
          <h2>Chuyển khoản thủ công</h2>
          <div className="checkout-detail-list">
            <div>
              <span>Số tiền</span>
              <div className="checkout-copy-group">
                <strong>{formatVnd(deposit.amount)}</strong>
                <button
                  className="copy-btn"
                  onClick={() => handleCopy(String(deposit.amount), "amount")}
                >
                  {copied === "amount" ? "✓" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <span>Nội dung chuyển khoản</span>
              <div className="checkout-copy-group">
                <strong style={{ fontFamily: "monospace", color: "var(--gold)" }}>{deposit.code}</strong>
                <button
                  className="copy-btn"
                  onClick={() => handleCopy(deposit.code, "code")}
                >
                  {copied === "code" ? "✓" : "Copy"}
                </button>
              </div>
            </div>
          </div>
          <p className="checkout-hint" style={{ marginTop: "1rem" }}>
            Giữ đúng nội dung chuyển khoản để hệ thống tự nhận diện và cộng tiền vào ví của anh/chị.
          </p>

          <button
            onClick={() => { setStep("form"); setDeposit(null); setAmount(""); }}
            style={{ marginTop: "1rem", background: "none", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 8, padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            ← Tạo giao dịch khác
          </button>
        </article>
      </section>
    );
  }

  // ─── Step: Success ───────────────────────────────────────────────────────────
  return (
    <section className="checkout-grid" style={{ marginTop: "2rem" }}>
      <article className="checkout-panel" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>✅</div>
        <span className="section-tag">Thành công</span>
        <h2>Nạp tiền thành công!</h2>
        {deposit && (
          <p style={{ color: "var(--green)", fontSize: "1.2rem", fontWeight: 700, margin: "0.5rem 0" }}>
            +{formatVnd(deposit.amount)}
          </p>
        )}
        {balance !== null && (
          <p style={{ color: "var(--muted)" }}>
            Số dư ví: <strong style={{ color: "var(--gold)" }}>{formatVnd(balance)}</strong>
          </p>
        )}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
          <button
            onClick={() => { setStep("form"); setDeposit(null); setAmount(""); setBalance(null); }}
            className="pay-button"
            style={{ flex: 1 }}
          >
            Nạp thêm
          </button>
          <Link href="/" className="pay-button" style={{ flex: 1, textAlign: "center" }}>
            Về trang chủ
          </Link>
        </div>
      </article>
    </section>
  );
}
