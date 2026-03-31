import { unstable_cache } from "next/cache";

export type RemoteItem = {
  href: string;
  image: string | null;
  name: string;
};

export type RemoteCategory = {
  href: string;
  image: string | null;
  items: RemoteItem[];
  slug: string;
  title: string;
};

export type Product = {
  categorySlug: string;
  categoryTitle: string;
  desc: string;
  href: string;
  id: string;
  price: string;
  stock: string;
  title: string;
};

export type ProductDetail = {
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

export const CLONE282_REVALIDATE = 300;

const MENU_URL = "https://clone282.net/ajaxs/client/load_menu.php";
const CATEGORY_BASE_URL = "https://clone282.net/category/";
const PRODUCTS_URL = "https://clone282.net/ajaxs/client/load_products.php";
const PRODUCT_MODAL_URL = "https://clone282.net/ajaxs/client/modal/view-product.php";
const PRODUCT_PREVIEW_URL = "https://clone282.net/ajaxs/client/modal/view-product-preview.php";

export function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function getHeaders() {
  const headers: HeadersInit = {};
  const apiKey = process.env.CLONE282_API_KEY;

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
    headers["X-API-KEY"] = apiKey;
  }

  return headers;
}

export function parseMenuHtml(menuHtml: string): RemoteCategory[] {
  const categories: RemoteCategory[] = [];
  const blockRegex = /<div class="megamenu-wrap">[\s\S]*?<h5 class="megamenu-title">([\s\S]*?)<\/h5>[\s\S]*?<ul class="megamenu-list">([\s\S]*?)<\/ul>[\s\S]*?<\/div>/g;

  for (const block of menuHtml.matchAll(blockRegex)) {
    const title = stripTags(block[1]);
    const listHtml = block[2];
    const items: RemoteItem[] = [];
    const itemRegex = /<li><a href="([^"]+)">([\s\S]*?)<\/a><\/li>/g;

    for (const item of listHtml.matchAll(itemRegex)) {
      const imageMatch = item[2].match(/<img[^>]+src="([^"]+)"/);

      items.push({
        href: decodeHtml(item[1]),
        image: imageMatch ? decodeHtml(imageMatch[1]) : null,
        name: stripTags(item[2])
      });
    }

    const firstHref = items[0]?.href ?? "";
    const slug = firstHref.split("/category/")[1] ?? "";
    const image = items[0]?.image ?? null;

    if (title && items.length > 0) {
      categories.push({ href: firstHref, image, items, slug, title });
    }
  }

  return categories;
}

export function pickAccountCategories(categories: RemoteCategory[]) {
  const keywords = ["CLONE", "PROFILE", "BM", "HOTMAIL", "OUTLOOK", "GMAIL", "TKQC", "VIA"];
  return categories.filter((category) => keywords.some((keyword) => category.title.toUpperCase().includes(keyword))).slice(0, 12);
}

export function extractCategoryId(categoryHtml: string) {
  const match = categoryHtml.match(/let currentCategoryId = '([^']+)'/);
  return match?.[1] ?? null;
}

export function parseProductsHtml(categorySlug: string, fallbackCategoryTitle: string, productsHtml: string): Product[] {
  const categoryTitleMatch = productsHtml.match(/<h3>[\s\S]*?<img[^>]*>[\s\S]*?([^<]+)<\/h3>/);
  const categoryTitle = categoryTitleMatch ? stripTags(categoryTitleMatch[1]) : fallbackCategoryTitle;
  const products: Product[] = [];
  const productRegex = /<div class="feature-card[\s\S]*?<h6 class="feature-name">[\s\S]*?<a\s+href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<p class="feature-desc">([\s\S]*?)<\/p>[\s\S]*?<label class="label-text feat">Kho hàng:[\s\S]*?<b>([^<]+)<\/b>[\s\S]*?<h5 class="feature-price">[\s\S]*?<span>([^<]+)<\/span>[\s\S]*?<button[^>]+data-id="([^"]+)"[\s\S]*?>Mua Ngay<\/button>/g;

  for (const match of productsHtml.matchAll(productRegex)) {
    products.push({
      categorySlug,
      categoryTitle,
      desc: stripTags(match[3]),
      href: decodeHtml(match[1]),
      id: match[6],
      price: stripTags(match[5]),
      stock: stripTags(match[4]),
      title: stripTags(match[2])
    });
  }

  return products;
}

export function parseProductDetailHtml(id: string, html: string, previewHtml?: string): ProductDetail {
  const title = stripTags(html.match(/<h3 class="view-name">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a><\/h3>/)?.[1] ?? "");
  const stock = stripTags(html.match(/Kho hàng:[\s\S]*?<strong>([^<]+)<\/strong>/)?.[1] ?? "");
  const price = stripTags(html.match(/<h3 class="view-price">[\s\S]*?<span>([^<]+)<\/span>/)?.[1] ?? "");
  const desc = stripTags(html.match(/<p class="view-desc">([\s\S]*?)<\/p>/)?.[1] ?? "");
  const buyButtonLabel = stripTags(html.match(/<button class="btn-buy"[^>]*>[\s\S]*?<span>([^<]+)<\/span>[\s\S]*?<\/button>/)?.[1] ?? "");
  const loginRequired = /client\/login/.test(html) || /Đăng Nhập/.test(buyButtonLabel);
  const favoriteAvailable = /addFavorite\(/.test(html);
  const previewSupported = previewHtml ? !/không hỗ trợ xem trước UID/i.test(previewHtml) : false;

  return {
    buyButtonLabel: buyButtonLabel || null,
    desc,
    favoriteAvailable,
    id,
    loginRequired,
    price,
    previewSupported,
    stock,
    title
  };
}

export const getClone282MenuData = unstable_cache(
  async () => {
    const response = await fetch(MENU_URL, {
      headers: getHeaders(),
      next: { revalidate: CLONE282_REVALIDATE }
    });

    if (!response.ok) {
      throw new Error("Failed to load remote menu");
    }

    const payload = (await response.json()) as { menu_html?: string };

    if (!payload.menu_html) {
      throw new Error("Remote menu payload missing");
    }

    const categories = parseMenuHtml(payload.menu_html);

    return {
      accountCategories: pickAccountCategories(categories).map((category) => ({
        count: category.items.length,
        href: category.href || "#",
        image: category.image,
        slug: category.slug,
        title: category.title
      })),
      categories
    };
  },
  ["clone282-menu"],
  { revalidate: CLONE282_REVALIDATE }
);

export const getClone282ProductsData = unstable_cache(
  async () => {
    const { categories } = await getClone282MenuData();
    const accountCategories = pickAccountCategories(categories);
    const headers = getHeaders();

    const enriched = await Promise.all(
      accountCategories.map(async (category) => {
        const categoryPage = await fetch(`${CATEGORY_BASE_URL}${category.slug}`, {
          headers,
          next: { revalidate: CLONE282_REVALIDATE }
        });

        if (!categoryPage.ok) {
          return { ...category, categoryId: null, products: [] as Product[] };
        }

        const categoryHtml = await categoryPage.text();
        const categoryId = extractCategoryId(categoryHtml);

        if (!categoryId) {
          return { ...category, categoryId: null, products: [] as Product[] };
        }

        const productsResponse = await fetch(`${PRODUCTS_URL}?type=categories&category_id=${categoryId}`, {
          headers,
          next: { revalidate: CLONE282_REVALIDATE }
        });

        if (!productsResponse.ok) {
          return { ...category, categoryId, products: [] as Product[] };
        }

        const productsHtml = await productsResponse.text();
        const products = parseProductsHtml(category.slug, category.title, productsHtml);
        return { ...category, categoryId, products };
      })
    );

    return {
      categories: enriched.map((category) => ({
        categoryId: category.categoryId,
        count: category.items.length,
        href: category.href,
        image: category.image,
        productCount: category.products.length,
        slug: category.slug,
        title: category.title
      })),
      products: enriched.flatMap((category) => category.products)
    };
  },
  ["clone282-products"],
  { revalidate: CLONE282_REVALIDATE }
);

export async function getClone282ProductDetail(id: string, token = "") {
  const cacheKey = `clone282-product-detail-${id}-${token || "no-token"}`;

  return unstable_cache(
    async () => {
      const headers = getHeaders();
      const detailUrl = `${PRODUCT_MODAL_URL}?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
      const previewUrl = `${PRODUCT_PREVIEW_URL}?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;

      const [detailResponse, previewResponse] = await Promise.all([
        fetch(detailUrl, { headers, next: { revalidate: CLONE282_REVALIDATE } }),
        fetch(previewUrl, { headers, next: { revalidate: CLONE282_REVALIDATE } })
      ]);

      if (!detailResponse.ok) {
        throw new Error("Failed to load product detail");
      }

      const [detailHtml, previewHtml] = await Promise.all([
        detailResponse.text(),
        previewResponse.ok ? previewResponse.text() : Promise.resolve("")
      ]);

      return parseProductDetailHtml(id, detailHtml, previewHtml);
    },
    [cacheKey],
    { revalidate: CLONE282_REVALIDATE }
  )();
}
