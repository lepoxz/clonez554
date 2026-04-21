import Link from "next/link";
import { redirect } from "next/navigation";
import ThemeToggle from "../../components/ui/theme-toggle";
import { getSession } from "../../services/auth";
import DepositClient from "./deposit-client";

export default async function DepositPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/deposit");
  }

  return (
    <main className="checkout-page-shell">
      <div className="checkout-page-top">
        <Link href="/" className="back-link">
          Quay về trang chủ
        </Link>
        <ThemeToggle />
      </div>

      <section className="checkout-hero-card">
        <div className="checkout-hero-copy">
          <span className="section-tag">Ví FB88</span>
          <h1>Nạp tiền vào ví</h1>
          <p>
            Chuyển khoản qua SePay QR — tiền sẽ tự động cộng vào ví sau khi ngân hàng xác nhận giao dịch.
            Không cần chụp màn hình hay liên hệ hỗ trợ.
          </p>
        </div>
        <div className="checkout-hero-meta">
          <div>
            <span>Tài khoản</span>
            <strong>{session.displayName}</strong>
          </div>
          <div>
            <span>Username</span>
            <strong>{session.username}</strong>
          </div>
          <div>
            <span>Phương thức</span>
            <strong>SePay QR • VietQR</strong>
          </div>
          <div>
            <span>Cộng tiền</span>
            <strong>Tức thì sau khi chuyển khoản</strong>
          </div>
        </div>
      </section>

      <DepositClient />
    </main>
  );
}
