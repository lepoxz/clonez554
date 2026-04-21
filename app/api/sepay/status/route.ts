import { NextRequest, NextResponse } from "next/server";
import { getSepayPaymentStatus, hasSepayStatusConfig, normalizeAmount, normalizeOrderCode } from "../../../../services/sepay";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const orderCodeParam = request.nextUrl.searchParams.get("orderCode") ?? "";
  const amountParam = request.nextUrl.searchParams.get("amount") ?? "";
  const orderCode = normalizeOrderCode(orderCodeParam);
  const amount = normalizeAmount(amountParam);

  if (!orderCode || amount <= 0) {
    return NextResponse.json({ error: "Missing orderCode or amount" }, { status: 400 });
  }

  try {
    const result = await getSepayPaymentStatus(orderCode, amount);

    return NextResponse.json({
      paidAt: result.payment?.paidAt ?? null,
      payment: result.payment,
      pollingEnabled: hasSepayStatusConfig(),
      source: result.source,
      status: result.status
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to verify payment status",
        pollingEnabled: hasSepayStatusConfig(),
        status: "pending"
      },
      { status: 500 }
    );
  }
}
