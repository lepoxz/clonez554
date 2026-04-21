import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { creditBalance, addTransaction, getBalance } from "../../../../services/wallet";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { username, amount, note } = await req.json();
  if (!username || !amount || amount <= 0) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }

  creditBalance(username, amount);
  addTransaction({
    username,
    type: "deposit",
    amount,
    description: note || `Admin nạp thủ công ${new Intl.NumberFormat("vi-VN").format(amount)}đ`,
  });

  const newBalance = getBalance(username);
  return NextResponse.json({ success: true, username, amount, newBalance });
}
