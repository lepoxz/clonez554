// ─── Auth Service (demo — cookie-based, no real DB) ────────────────────────────
import { cookies } from "next/headers";

export type SessionUser = {
  username: string;
  role: "admin" | "user";
  displayName: string;
};

const SESSION_COOKIE = "fb88_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

// ─── In-memory user store (demo) ───────────────────────────────────────────────
declare global {
  var __authUsers: Map<string, { passwordHash: string; displayName: string }> | undefined;
}

function getUserStore() {
  if (!globalThis.__authUsers) {
    globalThis.__authUsers = new Map();
  }
  return globalThis.__authUsers;
}

function simpleHash(password: string): string {
  // Demo only — NOT for production. Use bcrypt in real app.
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

// ─── Admin credentials ─────────────────────────────────────────────────────────
function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "admin@fb88demo";
}

// ─── Session helpers ────────────────────────────────────────────────────────────
export async function setSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(user)).toString("base64");
  cookieStore.set(SESSION_COOKIE, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/"
  });
}

export async function getSession(): Promise<SessionUser | null> {
    try {
          const cookieStore = await cookies();
          const value = cookieStore.get(SESSION_COOKIE)?.value;
          if (!value) return null;

          // When Modal backend is enabled, validate session via Modal API
          const MODAL_URL = process.env.MODAL_BACKEND_URL?.replace(/\/$/, "");
          if (MODAL_URL) {
                  try {
                            const res = await fetch(`${MODAL_URL}/auth/me`, {
                                        headers: { Cookie: `${SESSION_COOKIE}=${value}` },
                                        cache: "no-store",
                            });
                            if (!res.ok) return null;
                            const data = await res.json();
                            return data.user ?? null;
                  } catch {
                            return null;
                  }
          }

          // Fallback: decode base64 JSON (in-memory mode)
          return JSON.parse(Buffer.from(value, "base64").toString("utf-8")) as SessionUser;
    } catch {
          return null;
    }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ─── Login logic ────────────────────────────────────────────────────────────────
export type LoginResult =
  | { success: true; user: SessionUser }
  | { success: false; error: string };

export function loginUser(username: string, password: string): LoginResult {
  const u = username.trim().toLowerCase();
  const p = password.trim();

  if (!u || !p) return { success: false, error: "Vui lòng nhập đủ thông tin" };

  // Admin check
  if (u === "admin" && p === getAdminPassword()) {
    return {
      success: true,
      user: { username: "admin", role: "admin", displayName: "Admin FB88" }
    };
  }

  // Regular user check
  const store = getUserStore();
  const stored = store.get(u);
  if (!stored) return { success: false, error: "Tài khoản không tồn tại" };
  if (stored.passwordHash !== simpleHash(p)) return { success: false, error: "Sai mật khẩu" };

  return {
    success: true,
    user: { username: u, role: "user", displayName: stored.displayName }
  };
}

// ─── Register logic ─────────────────────────────────────────────────────────────
export type RegisterResult =
  | { success: true; user: SessionUser }
  | { success: false; error: string };

export function registerUser(displayName: string, username: string, password: string): RegisterResult {
  const u = username.trim().toLowerCase();
  const p = password.trim();
  const n = displayName.trim();

  if (!u || !p || !n) return { success: false, error: "Vui lòng nhập đủ thông tin" };
  if (p.length < 6) return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
  if (u === "admin") return { success: false, error: "Username này không được phép" };

  const store = getUserStore();
  if (store.has(u)) return { success: false, error: "Username đã tồn tại" };

  store.set(u, { passwordHash: simpleHash(p), displayName: n });

  return {
    success: true,
    user: { username: u, role: "user", displayName: n }
  };
}

export function getAllUsers(): Array<{ username: string; displayName: string }> {
  return Array.from(getUserStore().entries()).map(([username, { displayName }]) => ({
    username,
    displayName
  }));
}
