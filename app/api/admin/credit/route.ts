import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { creditBalance, getBalance } from "../../../../services/wallet";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (isModalEnabled()) return proxyToModal(req, "/admin/credit");
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const { username, amount, note } = await req.json();
  if (!username || !amount || amount <= 0) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  creditBalance(username, amount);
  const newBalance = getBalance(username);
  return NextResponse.json({ success: true, username, amount, newBalance });
}
