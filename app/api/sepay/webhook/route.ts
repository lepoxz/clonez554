import { NextRequest, NextResponse } from "next/server";
import {
  extractOrderCode,
  hasProcessedWebhookTransaction,
  markOrderPaid,
  markWebhookTransactionProcessed,
  normalizeAmount,
  verifySepayWebhookAuthorization,
  type SepayWebhookPayload
} from "../../../../services/sepay";
import { extractDepositCode, markDepositPaid } from "../../../../services/wallet";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!verifySepayWebhookAuthorization(request.headers.get("authorization"))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<SepayWebhookPayload>;

  if (typeof payload.id !== "number") {
    return NextResponse.json({ success: false, message: "Missing transaction id" }, { status: 400 });
  }

  if (hasProcessedWebhookTransaction(payload.id)) {
    return NextResponse.json({ success: true, duplicated: true }, { status: 200 });
  }

  if (payload.transferType !== "in") {
    markWebhookTransactionProcessed(payload.id);
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  const content = typeof payload.content === "string" ? payload.content : "";

  // ── Kiểm tra nạp tiền (deposit) trước ──────────────────────────────────────
  const depositCode = extractDepositCode(content);
  if (depositCode) {
    const updated = markDepositPaid(depositCode, {
      transactionId: payload.id,
      referenceCode: typeof payload.referenceCode === "string" ? payload.referenceCode : null
    });
    markWebhookTransactionProcessed(payload.id);

    if (updated) {
      console.log(`[SePay Webhook] Deposit credited: ${depositCode} → ${updated.username} +${updated.amount}đ`);
      return NextResponse.json({ success: true, type: "deposit", depositCode, username: updated.username }, { status: 201 });
    }
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  // ── Kiểm tra thanh toán đơn hàng sản phẩm ──────────────────────────────────
  const orderCode = extractOrderCode(content);
  if (!orderCode) {
    markWebhookTransactionProcessed(payload.id);
    return NextResponse.json({ success: true, ignored: true }, { status: 200 });
  }

  markOrderPaid(orderCode, {
    amount: normalizeAmount(payload.transferAmount),
    paidAt: typeof payload.transactionDate === "string" ? payload.transactionDate : new Date().toISOString(),
    referenceCode: typeof payload.referenceCode === "string" ? payload.referenceCode : null,
    transactionId: payload.id
  });
  markWebhookTransactionProcessed(payload.id);

  console.log(`[SePay Webhook] Order paid: ${orderCode}`);
  return NextResponse.json({ success: true, type: "order", orderCode }, { status: 201 });
}
