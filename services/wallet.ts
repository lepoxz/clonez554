// ─── Wallet Service (in-memory) ────────────────────────────────────────────────
// Quản lý số dư ví và lịch sử nạp tiền. Reset khi server restart (demo only).

export type DepositStatus = "pending" | "paid" | "expired";

export type DepositRecord = {
  code: string;         // FB88DEP-XXXXXX
  username: string;
  amount: number;
  status: DepositStatus;
  createdAt: string;
  paidAt?: string;
  transactionId?: number | null;
  referenceCode?: string | null;
};

export type WalletTransaction = {
  id: string;
  username: string;
  type: "deposit" | "payment";
  amount: number;        // dương = nạp vào, âm = thanh toán
  description: string;
  createdAt: string;
  orderCode?: string;
};

export type PurchasedOrder = {
  orderCode: string;
  username: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAt: string;
};

// ─── Global stores ─────────────────────────────────────────────────────────────
declare global {
  var __walletBalances: Map<string, number> | undefined;
  var __walletDeposits: Map<string, DepositRecord> | undefined;
  var __walletTransactions: WalletTransaction[] | undefined;
  var __walletOrders: PurchasedOrder[] | undefined;
}

function getBalanceStore(): Map<string, number> {
  if (!globalThis.__walletBalances) {
    globalThis.__walletBalances = new Map<string, number>([
      ["admin", 99_999_000], // Tài khoản demo mặc định
    ]);
  }
  return globalThis.__walletBalances;
}

function getDepositStore(): Map<string, DepositRecord> {
  if (!globalThis.__walletDeposits) {
    globalThis.__walletDeposits = new Map();
  }
  return globalThis.__walletDeposits;
}

function getTxStore(): WalletTransaction[] {
  if (!globalThis.__walletTransactions) {
    globalThis.__walletTransactions = [];
  }
  return globalThis.__walletTransactions;
}

// ─── Balance helpers ────────────────────────────────────────────────────────────
export function getBalance(username: string): number {
  return getBalanceStore().get(username.toLowerCase()) ?? 0;
}

export function creditBalance(username: string, amount: number): number {
  const store = getBalanceStore();
  const key = username.toLowerCase();
  const current = store.get(key) ?? 0;
  const next = current + amount;
  store.set(key, next);
  return next;
}

export function debitBalance(username: string, amount: number): { success: boolean; balance: number } {
  const store = getBalanceStore();
  const key = username.toLowerCase();
  const current = store.get(key) ?? 0;
  if (current < amount) return { success: false, balance: current };
  const next = current - amount;
  store.set(key, next);
  return { success: true, balance: next };
}

export function getAllBalances(): Array<{ username: string; balance: number }> {
  return Array.from(getBalanceStore().entries()).map(([username, balance]) => ({ username, balance }));
}

// ─── Deposit helpers ────────────────────────────────────────────────────────────
function generateDepositCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `FB88DEP${suffix}`;
}

export function createDeposit(username: string, amount: number): DepositRecord {
  const code = generateDepositCode();
  const record: DepositRecord = {
    code,
    username: username.toLowerCase(),
    amount,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  getDepositStore().set(code, record);
  return record;
}

export function getDeposit(code: string): DepositRecord | null {
  return getDepositStore().get(code.toUpperCase()) ?? null;
}

export function markDepositPaid(
  code: string,
  details: { transactionId?: number | null; referenceCode?: string | null }
): DepositRecord | null {
  const store = getDepositStore();
  const record = store.get(code.toUpperCase());
  if (!record || record.status === "paid") return record ?? null;

  const updated: DepositRecord = {
    ...record,
    status: "paid",
    paidAt: new Date().toISOString(),
    transactionId: details.transactionId ?? null,
    referenceCode: details.referenceCode ?? null
  };

  store.set(code.toUpperCase(), updated);

  // Credit the user's wallet
  creditBalance(updated.username, updated.amount);

  // Log transaction
  addTransaction({
    username: updated.username,
    type: "deposit",
    amount: updated.amount,
    description: `Nạp tiền qua SePay — mã ${code}`,
    orderCode: code
  });

  return updated;
}

export function getAllDeposits(): DepositRecord[] {
  return Array.from(getDepositStore().values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ─── Transaction log ────────────────────────────────────────────────────────────
function addTransaction(tx: Omit<WalletTransaction, "id" | "createdAt">): WalletTransaction {
  const record: WalletTransaction = {
    ...tx,
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString()
  };
  getTxStore().unshift(record); // newest first
  return record;
}

export function getAllTransactions(): WalletTransaction[] {
  return [...getTxStore()];
}

export function getUserTransactions(username: string): WalletTransaction[] {
  const key = username.toLowerCase();
  return getTxStore().filter((tx) => tx.username === key);
}

// ─── Order helpers ─────────────────────────────────────────────────────────────
function getOrderStore(): PurchasedOrder[] {
  if (!globalThis.__walletOrders) {
    globalThis.__walletOrders = [];
  }
  return globalThis.__walletOrders;
}

export function createOrder(order: Omit<PurchasedOrder, "paidAt" | "orderCode">): PurchasedOrder {
  const orderCode = `FB88-${order.productId}-${Date.now()}`.toUpperCase();
  const record: PurchasedOrder = { ...order, orderCode, paidAt: new Date().toISOString() };
  getOrderStore().unshift(record);
  return record;
}

export function getAllOrders(): PurchasedOrder[] {
  return [...getOrderStore()];
}

export function getUserOrders(username: string): PurchasedOrder[] {
  const key = username.toLowerCase();
  return getOrderStore().filter((o) => o.username === key);
}

// ─── Wallet payment (trừ ví mua sản phẩm) ──────────────────────────────────────
export type PayResult =
  | { success: true; order: PurchasedOrder; balance: number }
  | { success: false; error: string; balance: number };

export function payFromWallet(
  username: string,
  productId: string,
  productTitle: string,
  quantity: number,
  unitPrice: number
): PayResult {
  const total = unitPrice * quantity;
  if (total <= 0) return { success: false, error: "Số tiền không hợp lệ", balance: getBalance(username) };

  const debit = debitBalance(username, total);
  if (!debit.success) {
    return {
      success: false,
      error: `Số dư không đủ. Cần ${total.toLocaleString("vi-VN")}đ, ví đang có ${debit.balance.toLocaleString("vi-VN")}đ`,
      balance: debit.balance
    };
  }

  const order = createOrder({ username: username.toLowerCase(), productId, productTitle, quantity, unitPrice, totalAmount: total });

  addTransaction({
    username: username.toLowerCase(),
    type: "payment",
    amount: -total,
    description: `Mua "${productTitle}" x${quantity}`,
    orderCode: order.orderCode
  });

  return { success: true, order, balance: debit.balance };
}

// ─── Detect deposit code in webhook content ─────────────────────────────────────
export function extractDepositCode(content: string): string | null {
  const match = content.match(/FB88DEP[A-Z0-9]{6,12}/i);
  return match ? match[0].toUpperCase() : null;
}
