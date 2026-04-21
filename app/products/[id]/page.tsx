import Link from "next/link";
import ProductDetailClient from "./product-detail-client";
import { getClone282ProductDetail, getClone282ProductsData } from "../../../services/catalog-data";
import ThemeToggle from "../../../components/ui/theme-toggle";

function inferCountry(title: string) {
  const normalized = title.toUpperCase();

  if (normalized.includes("USA") || normalized.includes(" US") || normalized.includes("US ")) return "US";
  if (normalized.includes("VIỆT") || normalized.includes("VN")) return "VN";
  if (normalized.includes("THÁI") || normalized.includes("THAILAND") || normalized.includes("THAI")) return "TH";
  if (normalized.includes("INDO")) return "ID";
  if (normalized.includes("PHI") || normalized.includes("PHILIPINES")) return "PH";

  return "N/A";
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getClone282ProductDetail(id);
  const { products } = await getClone282ProductsData();
  const product = products.find((item) => item.id === id) ?? {
    categorySlug: "unknown",
    categoryTitle: "Đang cập nhật",
    desc: detail.desc,
    href: "#",
    id,
    price: detail.price,
    stock: detail.stock,
    title: detail.title
  };

  return (
    <main className="product-page-shell">
      <div className="product-page-top">
        <Link href="/" className="back-link">
          Quay về trang chủ
        </Link>
        <ThemeToggle />
      </div>

      <section className="product-hero-card">
        <div className="product-hero-copy">
          <span className="section-tag">Chi tiết sản phẩm</span>
          <h1>{detail.title || product.title}</h1>
          <p>{detail.desc || product.desc}</p>

          <div className="product-hero-tags">
            <span>{product.categoryTitle}</span>
            <span>Quốc gia: {inferCountry(product.title)}</span>
            <span>Kho: {detail.stock || product.stock}</span>
            <span>Giá: {detail.price || product.price}</span>
          </div>
        </div>

        <div className="product-hero-side">
          <div className="product-hero-metrics">
            <div>
              <span>Danh mục</span>
              <strong>{product.categoryTitle}</strong>
            </div>
            <div>
              <span>Kho hàng</span>
              <strong>{detail.stock || product.stock}</strong>
            </div>
            <div>
              <span>Giá hiện tại</span>
              <strong>{detail.price || product.price}</strong>
            </div>
            <div>
              <span>Preview UID</span>
              <strong>{detail.previewSupported ? "Có hỗ trợ" : "Không hỗ trợ"}</strong>
            </div>
            <div>
              <span>Yêu cầu login</span>
              <strong>{detail.loginRequired ? "Có" : "Không"}</strong>
            </div>
            <div>
              <span>Yêu thích</span>
              <strong>{detail.favoriteAvailable ? "Có hỗ trợ" : "Không hỗ trợ"}</strong>
            </div>
          </div>

          <ProductDetailClient detail={detail} />
        </div>
      </section>

      <section className="product-detail-sections product-detail-sections-single">
        <article className="product-detail-card">
          <span className="section-tag">Mô tả</span>
          <h2>Thông tin đầy đủ</h2>
          <p>{detail.desc || product.desc}</p>
        </article>
      </section>
    </main>
  );
}
