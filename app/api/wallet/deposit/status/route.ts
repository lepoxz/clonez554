import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../services/auth";
import { getDeposit } from "../../../../../services/wallet";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const code = request.nextUrl.searchParams.get("code") ?? "";
  if (!code) {
    return NextResponse.json({ error: "Thiếu mã nạp tiền" }, { status: 400 });
  }

  const deposit = getDeposit(code);
  if (!deposit) {
    return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
  }

  // Security: only the owner can check their deposit
  if (deposit.username !== session.username && session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  return NextResponse.json({ deposit });
}
