import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { getUserOrders, getUserTransactions, getBalance, getAllDeposits } from "../../../../services/wallet";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/wallet/orders");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const orders = getUserOrders(session.username);
  const transactions = getUserTransactions(session.username);
  const balance = getBalance(session.username);

  const deposits = getAllDeposits().filter(
    (d) => d.username === session.username.toLowerCase()
  );

  return NextResponse.json({ orders, transactions, deposits, balance, user: session });
}
