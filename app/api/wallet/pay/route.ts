import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { payFromWallet } from "../../../../services/wallet";
import { normalizeAmount } from "../../../../services/sepay";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/wallet/pay");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = (await request.json()) as {
    productId?: string;
    productTitle?: string;
    quantity?: number;
    unitPrice?: string | number;
  };

  const productId = (body.productId ?? "").trim();
  const productTitle = (body.productTitle ?? "Sản phẩm").trim();
  const quantity = Math.max(1, Number(body.quantity) || 1);
  const unitPrice = normalizeAmount(body.unitPrice);

  if (!productId) {
    return NextResponse.json({ success: false, error: "Thiếu thông tin sản phẩm" }, { status: 400 });
  }
  if (unitPrice <= 0) {
    return NextResponse.json({ success: false, error: "Giá sản phẩm không hợp lệ" }, { status: 400 });
  }

  const result = payFromWallet(session.username, productId, productTitle, quantity, unitPrice);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, balance: result.balance }, { status: 402 });
  }

  return NextResponse.json({
    success: true,
    order: result.order,
    balance: result.balance
  });
}
