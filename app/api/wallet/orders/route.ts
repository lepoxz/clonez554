import { NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { getUserOrders, getUserTransactions, getBalance, getAllDeposits } from "../../../../services/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const orders = getUserOrders(session.username);
  const transactions = getUserTransactions(session.username);
  const balance = getBalance(session.username);

  // Lọc deposits của user
  const deposits = getAllDeposits().filter(
    (d) => d.username === session.username.toLowerCase()
  );

  return NextResponse.json({ orders, transactions, deposits, balance, user: session });
}
