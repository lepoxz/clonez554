import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ST Shop | Hệ thống cung cấp tài nguyên & tool mmo",
  description: "Landing page mô phỏng ST Shop với bố cục sidebar, bảng sản phẩm và khu vực hỗ trợ khách hàng."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
