/**
 * Proxy helper — forward Next.js API requests sang Modal backend.
 * Set MODAL_BACKEND_URL trong .env.local để kích hoạt.
 * Nếu chưa set thì dung in-memory như cŵ.
 */

export const MODAL_URL = process.env.MODAL_BACKEND_URL?.replace(/\/$/, "");

export function isModalEnabled() {
  return !!MODAL_URL;
}

/**
 * Forward một Next.js Request sang Modal backend, giữ nguyên cookies + body.
 */
export async function proxyToModal(
  request: Request,
  path: string,
  options?: { method?: string; body?: unknown }
): Promise<Response> {
  if (!MODAL_URL) throw new Error("MODAL_BACKEND_URL chđu đợc set");

  const url = `${MODAL_URL}${path}`;
  const method = options?.method ?? request.method;
  const cookie = request.headers.get("cookie") ?? "";

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  };

  if (options?.body !== undefined) {
    init.body = JSON.stringify(options.body);
  } else if (method !== "GET" && method !== "HEAD") {
    try {
      const cloned = request.clone();
      init.body = await cloned.text();
    } catch {
      // no body
    }
  }

  const res = await fetch(url, init);

  // Forward Set-Cookie tỳ Modal về client
  const headers = new Headers({ "Content-Type": "application/json" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) headers.set("set-cookie", setCookie);

  const data = await res.json().catch(() => ({}));
  return new Response(JSON.stringify(data), { status: res.status, headers });
}
