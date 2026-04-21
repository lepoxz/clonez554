"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "../ui/theme-toggle";
import UserNav from "../ui/user-nav";

type AccountCategory = {
  count: number;
  href: string;
  image: string | null;
  productCount?: number;
  title: string;
  slug?: string;
};

type Product = {
  categorySlug: string;
  categoryTitle: string;
  desc: string;
  href: string;
  id: string;
  price: string;
  stock: string;
  title: string;
};

type ProductDetail = {
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

type SortBy = "name" | "price" | "stock";
type SortOrder = "asc" | "desc";

const sidebarGroups = [
  {
    title: "Tổng quan",
    items: [
      "Trang Chủ",
      {
        label: "Mua Tài Khoản",
        children: ["CLONE US", "CLONE VIỆT", "CLONE THÁI", "VIA CỔ", "TÀI KHOẢN OTP"]
      },
      "Thuê Gmail OTP",
      "Lịch Sử Mua Hàng",
      "ST Domain Mail"
    ]
  },
  {
    title: "Nạp tiền",
    items: ["Ngân Hàng", "Hoá Đơn"]
  },
  {
    title: "Khác",
    items: ["Bài Viết", "Công Cụ", "Tài Liệu API", "Liên Hệ"]
  }
];

const warnings = [
  {
    title: "Tránh đăng ký trùng tài khoản",
    text: "Không dùng chung thông tin với các website khác để đảm bảo an toàn tài chính và hạn chế thất thoát tài nguyên."
  },
  {
    title: "Nạp tiền đủ dùng",
    text: "Hệ thống không hỗ trợ hoàn tiền trong mọi trường hợp để hạn chế hành vi rửa tiền và giao dịch bất thường."
  },
  {
    title: "Sử dụng đúng mục đích",
    text: "Khách hàng tự chịu trách nhiệm pháp lý cho việc sử dụng clone, tài nguyên số và các công cụ đi kèm."
  },
  {
    title: "Mua nhỏ để test trước",
    text: "Nên kiểm tra chất lượng với số lượng nhỏ trước khi đặt sỉ để tránh rủi ro vận hành."
  }
];

const admins = [
  { initials: "AQ", name: "Admin Anh Quân", role: "Chuyên gia Kỹ thuật", link: "https://zalo.me/0876277977" },
];

const salesPartner = {
  name: "K-Cosmic",
  role: "Chuyên viên Sales",
  link: "https://zalo.me/doremonmmo",
  image: "https://tainguyenst.com/assets/img/kcosmic.jpg"
};

const recentOrders = [
  { user: "...681", quantity: "15", item: "VIP 2", amount: "30.000đ", time: "9 phút trước" },
  { user: "...per", quantity: "15", item: "VIP 4", amount: "60.000đ", time: "23 phút trước" },
  { user: "...018", quantity: "7", item: "VIP 3", amount: "24.500đ", time: "38 phút trước" },
  { user: "...k10", quantity: "12", item: "VIP 5", amount: "19.200đ", time: "56 phút trước" },
  { user: "...432", quantity: "12", item: "VIP 0", amount: "24.000đ", time: "2 tiếng trước" }
];

const recentDeposits = [
  { user: "...ong", amount: "780.000đ", bank: "ACB", time: "11 phút trước" },
  { user: "...t63", amount: "50.000đ", bank: "ACB", time: "31 phút trước" },
  { user: "...anw", amount: "960.000đ", bank: "ACB", time: "57 phút trước" },
  { user: "...h16", amount: "540.000đ", bank: "ACB", time: "1 tiếng trước" },
  { user: "...179", amount: "370.000đ", bank: "ACB", time: "2 tiếng trước" }
];

const supportServices = [
  "Xử lý lỗi nạp tiền, kiểm tra ví và xác nhận giao dịch.",
  "Tư vấn mua clone, hàng số lượng lớn và cấu hình phù hợp mục đích dùng.",
  "Hỗ trợ đăng nhập lần đầu khi phát sinh lỗi sai dữ liệu.",
  "Giải đáp thắc mắc về Gmail OTP, tool và các dịch vụ liên quan."
];

const fallbackAccountCategories: AccountCategory[] = [
  { title: "CLONE NGOẠI", href: "#", count: 10, image: null, slug: "clone-ngoai" },
  { title: "CLONE VIỆT NAM", href: "#", count: 4, image: null, slug: "clone-viet-nam" },
  { title: "PROFILE NGOẠI", href: "#", count: 14, image: null, slug: "profile-ngoai" },
  { title: "PROFILE VIỆT NAM", href: "#", count: 8, image: null, slug: "profile-viet-nam" },
  { title: "BM", href: "#", count: 9, image: null, slug: "bm" },
  { title: "HOTMAIL - OUTLOOK", href: "#", count: 4, image: null, slug: "hotmail-outlook" }
];

function WalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d?.user) return;
        setLoggedIn(true);
        return fetch("/api/wallet/balance").then((r) => r.ok ? r.json() : null);
      })
      .then((d) => { if (d?.balance !== undefined) setBalance(d.balance); })
      .catch(() => {});
  }, []);

  const formatted = balance !== null
    ? `${new Intl.NumberFormat("vi-VN").format(balance)}đ`
    : "0đ";

  return (
    <div className="wallet-card">
      <span className="meta-label">Số dư ví</span>
      <strong>{loggedIn ? formatted : "0đ"}</strong>
      {loggedIn
        ? <Link href="/deposit" style={{ fontSize: "0.72rem", color: "var(--gold)", textDecoration: "none" }}>+ Nạp tiền</Link>
        : <Link href="/login" style={{ fontSize: "0.72rem", color: "var(--gold)", textDecoration: "none" }}>Đăng nhập</Link>
      }
    </div>
  );
}

export default function HomeContent() {
  const PRODUCTS_PER_PAGE = 10;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountCategories, setAccountCategories] = useState<AccountCategory[]>(fallbackAccountCategories);
  const [apiStatus, setApiStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("stock");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "error">("idle");
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>("Mua Tài Khoản");
  const catalogPanelRef = useRef<HTMLElement | null>(null);

  function scrollToCatalog() {
    catalogPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectCategory(slug: string) {
    setSelectedCategorySlug(slug);
    setSidebarOpen(false);
    setSelectedProductDetail(null);
    scrollToCatalog();
  }

  function toggleMenu(label: string) {
    setOpenMenuLabel((current) => (current === label ? null : label));
  }

  useEffect(() => {
    const category = searchParams.get("category") ?? "all";
    const q = searchParams.get("q") ?? "";
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");
    const page = Number(searchParams.get("page") ?? "1");

    setSelectedCategorySlug(category || "all");
    setSearchTerm(q);
    setDebouncedSearchTerm(q);
    setSortBy(sort === "name" || sort === "price" || sort === "stock" ? sort : "stock");
    setSortOrder(order === "asc" || order === "desc" ? order : "desc");
    setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [menuResponse, productsResponse] = await Promise.all([
          fetch("/api/catalog/menu", { cache: "no-store" }),
          fetch("/api/catalog/products", { cache: "no-store" })
        ]);

        if (!menuResponse.ok || !productsResponse.ok) {
          throw new Error("Failed to fetch remote data");
        }

        const menuPayload = (await menuResponse.json()) as { accountCategories?: AccountCategory[] };
        const productsPayload = (await productsResponse.json()) as {
          categories?: AccountCategory[];
          products?: Product[];
        };

        if (!active || !menuPayload.accountCategories?.length || !productsPayload.products?.length) {
          throw new Error("No remote data returned");
        }

        setAccountCategories(productsPayload.categories?.length ? productsPayload.categories : menuPayload.accountCategories);
        setAllProducts(productsPayload.products);
        setApiStatus("ready");
      } catch {
        if (active) {
          setApiStatus("fallback");
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchTerm]);

  function parseMetricValue(value: string) {
    const numeric = Number(value.replace(/[^\d]/g, ""));
    return Number.isNaN(numeric) ? 0 : numeric;
  }

  const filteredProducts = useMemo(() => {
    const categoryProducts = selectedCategorySlug === "all"
      ? allProducts
      : allProducts.filter((product) => product.categorySlug === selectedCategorySlug);

    const keyword = debouncedSearchTerm.trim().toLowerCase();

    const searchedProducts = !keyword
      ? categoryProducts
      : categoryProducts.filter((product) => {
          const searchable = `${product.title} ${product.desc} ${product.categoryTitle}`.toLowerCase();
          return searchable.includes(keyword);
        });

    return [...searchedProducts].sort((left, right) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = left.title.localeCompare(right.title, "vi");
      }

      if (sortBy === "price") {
        comparison = parseMetricValue(left.price) - parseMetricValue(right.price);
      }

      if (sortBy === "stock") {
        comparison = parseMetricValue(left.stock) - parseMetricValue(right.stock);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [allProducts, debouncedSearchTerm, selectedCategorySlug, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const activeCategoryTitle =
    selectedCategorySlug === "all"
      ? "Tất cả sản phẩm"
      : accountCategories.find((category) => category.slug === selectedCategorySlug)?.title ?? "Danh mục";

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategorySlug, debouncedSearchTerm, sortBy, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategorySlug !== "all") {
      params.set("category", selectedCategorySlug);
    }

    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    }

    if (sortBy !== "stock") {
      params.set("sort", sortBy);
    }

    if (sortOrder !== "desc") {
      params.set("order", sortOrder);
    }

    if (currentPage > 1) {
      params.set("page", String(currentPage));
    }

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next, { scroll: false });
  }, [currentPage, pathname, router, searchTerm, selectedCategorySlug, sortBy, sortOrder]);

  function inferCountry(title: string) {
    const normalized = title.toUpperCase();

    if (normalized.includes("USA") || normalized.includes("US")) {
      return "US";
    }

    if (normalized.includes("VIỆT") || normalized.includes("VN")) {
      return "VN";
    }

    if (normalized.includes("THÁI") || normalized.includes("THAILAND") || normalized.includes("THAI")) {
      return "TH";
    }

    if (normalized.includes("INDO")) {
      return "ID";
    }

    if (normalized.includes("PHI") || normalized.includes("PHILIPINES")) {
      return "PH";
    }

    return "N/A";
  }

  async function loadProductDetail(product: Product) {
    try {
      setDetailStatus("loading");
      const response = await fetch(`/api/catalog/product-detail?id=${encodeURIComponent(product.id)}`, {
        cache: "force-cache"
      });

      if (!response.ok) {
        throw new Error("Failed to load product detail");
      }

      const payload = (await response.json()) as { detail?: ProductDetail };

      if (!payload.detail) {
        throw new Error("Missing detail payload");
      }

      setSelectedProductDetail(payload.detail);
      setDetailStatus("idle");
    } catch {
      setDetailStatus("error");
      setSelectedProductDetail(null);
    }
  }

  function resetFilters() {
    setSelectedCategorySlug("all");
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSortBy("stock");
    setSortOrder("desc");
    setCurrentPage(1);
    setSelectedProductDetail(null);
    scrollToCatalog();
  }

  return (
    <main className="app-shell">
      <button
        type="button"
        className={`sidebar-overlay${sidebarOpen ? " is-visible" : ""}`}
        aria-label="Đóng menu"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar${sidebarOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="sidebar-close"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>

        <div className="sidebar-brand">
          <Image
            src="/logo-square-1024.png"
            alt="FB88 MMO"
            width={88}
            height={88}
            className="brand-logo"
          />
          <div>
            <p className="eyebrow">FB88 MMO</p>
            <h1>FB88 MMO</h1>
            <p className="brand-copy">Hệ thống cung cấp tài nguyên & tool mmo.</p>
          </div>
        </div>

        <div className="sidebar-meta">
          <div>
            <span className="meta-label">Ngôn ngữ</span>
            <strong>Vietnamese</strong>
          </div>
          <div>
            <span className="meta-label">Tiền tệ</span>
            <strong>VND</strong>
          </div>
        </div>

        <WalletCard />

        <div className="menu-stack">
          {sidebarGroups.map((group) => (
            <section key={group.title} className="menu-group">
              <p className="menu-heading">{group.title}</p>
              <div className="menu-links">
                {group.items.map((item) =>
                  typeof item === "string" ? (
                    <a key={item} href="#" className="menu-link">
                      <span className="menu-dot" aria-hidden="true"></span>
                      {item}
                    </a>
                  ) : (
                    <div key={item.label} className="menu-subgroup">
                      <button
                        type="button"
                        className="menu-link menu-link-parent menu-button"
                        aria-expanded={openMenuLabel === item.label}
                        onClick={() => toggleMenu(item.label)}
                      >
                        <span className="menu-link-label">
                          <span className="menu-dot" aria-hidden="true"></span>
                          {item.label}
                        </span>
                        <span className={`menu-caret${openMenuLabel === item.label ? " is-open" : ""}`} aria-hidden="true">
                          ▾
                        </span>
                      </button>
                      {openMenuLabel === item.label ? (
                        <div className="submenu-links">
                          {accountCategories.map((category) => (
                            <button
                              key={category.title}
                              type="button"
                              className={`submenu-link submenu-button${selectedCategorySlug === category.slug ? " is-active" : ""}`}
                              onClick={() => selectCategory(category.slug ?? "all")}
                            >
                              <span>{category.title}</span>
                              <strong>{category.productCount ?? category.count}</strong>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <section className="content-shell">
        <header className="topbar">
          <div className="topbar-title">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label="Mở menu"
              onClick={() => setSidebarOpen(true)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <p className="eyebrow">FB88 MMO</p>
            <h2>FB88 MMO | Hệ thống cung cấp tài nguyên & tool mmo</h2>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        <section className="notice-stage panel">
          <div className="notice-shell">
            <div className="notice-titlebar">
              <h3>Lưu Ý Quan Trọng Dành Cho Khách Hàng</h3>
            </div>

            <div className="warning-list">
              {warnings.map((warning) => (
                <article key={warning.title} className="warning-item">
                  <span className="warning-icon" aria-hidden="true">
                    !
                  </span>
                  <div>
                    <strong>{warning.title}</strong>
                    <p>{warning.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="promo-banner">
              <span className="promo-title">Thông báo quan trọng</span>
              <p>
                Website mới khai trương, giảm giá <strong>50%</strong> cho toàn bộ dịch vụ trong thời gian
                có hạn. Anh em tranh thủ nhé.
              </p>
            </div>

            <div className="admin-zone">
              <div className="admin-zone-title">
                <span className="section-tag">Hỗ trợ 24/7</span>
                <h3>Cần mua hàng SSL hoặc xử lý lỗi nạp tiền vui lòng liên hệ admin bên dưới</h3>
              </div>

              <div className="admin-grid">
                {admins.map((admin) => (
                  <a key={admin.name} href={admin.link} className="admin-card">
                    <span className="admin-avatar">{admin.initials}</span>
                    <span className="admin-copy">
                      <strong>{admin.name}</strong>
                      <small>{admin.role}</small>
                      <em>Liên hệ Zalo</em>
                    </span>
                  </a>
                ))}

                <a href={salesPartner.link} className="admin-card admin-card-image">
                  <Image src={salesPartner.image} alt={salesPartner.name} width={46} height={46} />
                  <span className="admin-copy">
                    <strong>{salesPartner.name}</strong>
                    <small>{salesPartner.role}</small>
                    <em>Liên hệ Zalo</em>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section ref={catalogPanelRef} className="panel catalog-panel">
          <div className="catalog-heading">
            <div>
              <span className="section-tag">Danh mục sản phẩm</span>
              <h3>{activeCategoryTitle}</h3>
            </div>
          </div>

          <div className="catalog-toolbar">
            <label className="catalog-search">
              <span>Tìm kiếm sản phẩm</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nhập tên sản phẩm, mô tả hoặc danh mục"
              />
            </label>
            <div className="catalog-sort">
              <label>
                <span>Sắp xếp theo</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
                  <option value="stock">Kho hàng</option>
                  <option value="price">Giá</option>
                  <option value="name">Tên</option>
                </select>
              </label>
              <label>
                <span>Thứ tự</span>
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </label>
            </div>
            <div className="catalog-stats">
              <span>{filteredProducts.length} sản phẩm</span>
              <span>Trang {currentPage}/{totalPages}</span>
              <button type="button" className="reset-filters" onClick={resetFilters}>
                Reset bộ lọc
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Quốc gia</th>
                  <th>Xem trước</th>
                  <th>Hiện có</th>
                  <th>Đã bán</th>
                  <th>Giá</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.title}>
                    <td>
                      <div className="product-cell">
                        <Image
                          src="https://tainguyenst.com/assets/storage/images/categoryUGVB.png"
                          alt="Danh mục"
                          width={32}
                          height={32}
                          className="product-mark"
                        />
                        <div>
                          <strong>
                            <Link href={`/products/${product.id}`}>{product.title}</Link>
                          </strong>
                          <div className="stars" aria-hidden="true">
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                            <span>★</span>
                          </div>
                          <p>{product.desc}</p>
                          <small className="product-category-label">{product.categoryTitle}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="country-pill">{inferCountry(product.title)}</span>
                    </td>
                    <td>
                      <div className="product-actions-inline">
                        <button className="preview-link preview-button" type="button" onClick={() => loadProductDetail(product)}>
                          Xem nhanh
                        </button>
                        <Link href={`/products/${product.id}`} className="preview-link">
                          Trang chi tiết
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className="metric metric-info">{product.stock}</span>
                    </td>
                    <td>
                      <span className="metric metric-success">Live</span>
                    </td>
                    <td>
                      <span className="metric metric-danger">{product.price}</span>
                    </td>
                    <td>
                      <Link className="buy-button buy-button-table buy-link" href={`/products/${product.id}`}>
                        Mua ngay
                      </Link>
                    </td>
                  </tr>
                ))}
                {visibleProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-products">Chưa tải được sản phẩm cho danh mục này.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <button type="button" className="pagination-button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
              Trang trước
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-number${page === currentPage ? " is-active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
            </div>
            <button type="button" className="pagination-button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
              Trang sau
            </button>
          </div>

          <div className="detail-panel">
            {detailStatus === "loading" ? <div className="detail-empty">Đang tải chi tiết sản phẩm...</div> : null}
            {detailStatus === "error" ? <div className="detail-empty">Không thể tải chi tiết sản phẩm.</div> : null}
            {!selectedProductDetail && detailStatus === "idle" ? (
              <div className="detail-empty">Chọn một sản phẩm trong bảng để xem thêm thông tin mua hàng live.</div>
            ) : null}
            {selectedProductDetail ? (
              <div className="detail-card">
                <div className="detail-card-head">
                  <div>
                    <span className="section-tag">Chi tiết sản phẩm</span>
                    <h3>{selectedProductDetail.title}</h3>
                  </div>
                  <span className="api-chip api-chip-ready">Cache 5 phút</span>
                </div>
                <p className="detail-desc">{selectedProductDetail.desc}</p>
                <div className="detail-metrics">
                  <div className="detail-metric">
                    <span>Kho hàng</span>
                    <strong>{selectedProductDetail.stock}</strong>
                  </div>
                  <div className="detail-metric">
                    <span>Giá</span>
                    <strong>{selectedProductDetail.price}</strong>
                  </div>
                  <div className="detail-metric">
                    <span>Preview UID</span>
                    <strong>{selectedProductDetail.previewSupported ? "Có" : "Không"}</strong>
                  </div>
                  <div className="detail-metric">
                    <span>Yêu cầu đăng nhập</span>
                    <strong>{selectedProductDetail.loginRequired ? "Có" : "Không"}</strong>
                  </div>
                </div>
                <div className="detail-tags">
                  <span>{selectedProductDetail.buyButtonLabel ?? "Mua ngay"}</span>
                  <span>{selectedProductDetail.favoriteAvailable ? "Có mục yêu thích" : "Không có yêu thích"}</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="content-grid content-grid-single">
          <div className="activity-stack">
            <article className="panel activity-panel">
              <div className="activity-headbar">
                <h3>Đơn hàng gần đây</h3>
              </div>
              <div className="activity-list">
                {recentOrders.map((order) => (
                  <div key={`${order.user}-${order.time}`} className="activity-item">
                    <p>
                      <strong>{order.user}</strong> mua <strong>{order.quantity}</strong> <strong>{order.item}</strong>
                      <span>{order.amount}</span>
                    </p>
                    <small>{order.time}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel activity-panel">
              <div className="activity-headbar">
                <h3>Nạp tiền gần đây</h3>
              </div>
              <div className="activity-list">
                {recentDeposits.map((deposit) => (
                  <div key={`${deposit.user}-${deposit.time}`} className="activity-item">
                    <p>
                      <strong>{deposit.user}</strong> nạp <strong>{deposit.amount}</strong>
                      <span>{deposit.bank}</span>
                    </p>
                    <small>{deposit.time}</small>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="panel support-footer">
          <div>
            <span className="section-tag">Support</span>
            <h3>[SUPPORT] Hỗ Trợ Khách Hàng 24/7</h3>
            <p>
              Hỗ trợ mua hàng SSL, xử lý lỗi nạp tiền, tư vấn kỹ thuật và giải quyết sự cố phát sinh nhanh.
            </p>
          </div>
          <div className="support-services">
            {supportServices.map((service) => (
              <article key={service} className="service-card">
                <strong>Dịch vụ hỗ trợ</strong>
                <p>{service}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}