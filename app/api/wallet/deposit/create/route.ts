import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../services/auth";
import { createDeposit } from "../../../../../services/wallet";
import { buildSepayQrUrl, hasSepayCheckoutConfig, normalizeAmount } from "../../../../../services/sepay";
import { isModalEnabled, proxyToModal } from "../../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/wallet/deposit");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = (await request.json()) as { amount?: string | number };
  const amount = normalizeAmount(body.amount);

  if (!amount || amount < 10000) {
    return NextResponse.json({ error: "Số tiền nạp tối thiểu là 10.000đ" }, { status: 400 });
  }

  if (amount > 50_000_000) {
    return NextResponse.json({ error: "Số tiền nạp tối đa là 50.000.000đ" }, { status: 400 });
  }

  const deposit = createDeposit(session.username, amount);
  const checkoutReady = hasSepayCheckoutConfig();
  const qrUrl = checkoutReady ? buildSepayQrUrl({ amount, orderCode: deposit.code }) : null;

  return NextResponse.json({ deposit, qrUrl, checkoutReady });
}
