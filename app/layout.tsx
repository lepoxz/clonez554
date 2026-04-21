import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FB88 MMO | Hệ thống cung cấp tài nguyên & tool mmo",
  description: "FB88 MMO | Hệ thống cung cấp tài nguyên & tool mmo",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
