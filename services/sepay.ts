type PaymentStatus = "pending" | "paid";

export type SepayConfig = {
  accountName: string;
  accountNumber: string;
  apiToken: string;
  bank: string;
  qrTemplate: string;
  webhookApiKey: string;
};

export type SepayWebhookPayload = {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description: string;
};

type PaidRecord = {
  amount: number;
  paidAt: string;
  referenceCode: string | null;
  transactionId: number | null;
};

const DEFAULT_QR_TEMPLATE = "compact";

declare global {
  var __sepayPaidOrders: Map<string, PaidRecord> | undefined;
  var __sepayWebhookTransactionIds: Set<number> | undefined;
}

function getPaidOrdersStore() {
  if (!globalThis.__sepayPaidOrders) {
    globalThis.__sepayPaidOrders = new Map<string, PaidRecord>();
  }

  return globalThis.__sepayPaidOrders;
}

function getWebhookTransactionIdsStore() {
  if (!globalThis.__sepayWebhookTransactionIds) {
    globalThis.__sepayWebhookTransactionIds = new Set<number>();
  }

  return globalThis.__sepayWebhookTransactionIds;
}

export function getSepayConfig(): SepayConfig {
  return {
    accountName: process.env.SEPAY_ACCOUNT_NAME?.trim() ?? "",
    accountNumber: process.env.SEPAY_ACCOUNT_NUMBER?.trim() ?? "",
    apiToken: process.env.SEPAY_API_TOKEN?.trim() ?? "",
    bank: process.env.SEPAY_BANK?.trim() ?? "",
    qrTemplate: process.env.SEPAY_QR_TEMPLATE?.trim() || DEFAULT_QR_TEMPLATE,
    webhookApiKey: process.env.SEPAY_WEBHOOK_API_KEY?.trim() ?? ""
  };
}

export function hasSepayCheckoutConfig() {
  const config = getSepayConfig();
  return Boolean(config.bank && config.accountNumber && config.accountName);
}

export function hasSepayStatusConfig() {
  const config = getSepayConfig();
  return Boolean(config.apiToken && config.accountNumber);
}

export function formatVnd(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

export function parseMoney(value: string) {
  const numeric = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function normalizeAmount(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  return parseMoney(value);
}

export function normalizeOrderCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function buildSepayQrUrl({ amount, orderCode }: { amount: number; orderCode: string }) {
  const config = getSepayConfig();
  const params = new URLSearchParams({
    acc: config.accountNumber,
    amount: String(amount),
    bank: config.bank,
    des: orderCode,
    template: config.qrTemplate || DEFAULT_QR_TEMPLATE
  });

  return `https://qr.sepay.vn/img?${params.toString()}`;
}

export function getPaidOrder(orderCode: string) {
  return getPaidOrdersStore().get(normalizeOrderCode(orderCode)) ?? null;
}

export function markOrderPaid(orderCode: string, details: PaidRecord) {
  getPaidOrdersStore().set(normalizeOrderCode(orderCode), details);
}

export function hasProcessedWebhookTransaction(transactionId: number) {
  return getWebhookTransactionIdsStore().has(transactionId);
}

export function markWebhookTransactionProcessed(transactionId: number) {
  getWebhookTransactionIdsStore().add(transactionId);
}

export function extractOrderCode(content: string) {
  const match = content.match(/FB88[A-Z0-9-]+/i);
  return match ? normalizeOrderCode(match[0]) : null;
}

export function verifySepayWebhookAuthorization(authorizationHeader: string | null) {
  const { webhookApiKey } = getSepayConfig();

  if (!webhookApiKey) {
    return false;
  }

  return authorizationHeader === `Apikey ${webhookApiKey}`;
}

export async function getSepayPaymentStatus(orderCode: string, amount: number): Promise<{
  payment: PaidRecord | null;
  status: PaymentStatus;
  source: "memory" | "sepay_api" | "pending";
}> {
  const normalizedCode = normalizeOrderCode(orderCode);
  const cached = getPaidOrder(normalizedCode);

  if (cached && cached.amount === amount) {
    return { payment: cached, status: "paid", source: "memory" };
  }

  const config = getSepayConfig();

  if (!config.apiToken || !config.accountNumber) {
    return { payment: null, status: "pending", source: "pending" };
  }

  const url = new URL("https://my.sepay.vn/userapi/transactions/list");
  url.searchParams.set("account_number", config.accountNumber);
  url.searchParams.set("limit", "50");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to query SePay transactions");
  }

  const payload = (await response.json()) as {
    transactions?: Array<{
      amount_in: string;
      id: string;
      reference_number: string | null;
      transaction_content: string;
      transaction_date: string;
    }>;
  };

  const matched = payload.transactions?.find((transaction) => {
    const content = normalizeOrderCode(transaction.transaction_content);
    const incomingAmount = normalizeAmount(transaction.amount_in);
    return incomingAmount === amount && content.includes(normalizedCode);
  });

  if (!matched) {
    return { payment: null, status: "pending", source: "pending" };
  }

  const payment = {
    amount,
    paidAt: matched.transaction_date,
    referenceCode: matched.reference_number,
    transactionId: Number(matched.id)
  };

  markOrderPaid(normalizedCode, payment);
  return { payment, status: "paid", source: "sepay_api" };
}
