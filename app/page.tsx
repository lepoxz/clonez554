import { Suspense } from "react";
import HomeContent from "../components/home/home-content";

export default function Home() {
  return (
    <Suspense fallback={<div className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Đang tải...</div>}>
      <HomeContent />
    </Suspense>
  );
}
