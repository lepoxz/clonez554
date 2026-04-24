import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { getAllDeposits, getAllBalances, getAllTransactions, getAllOrders } from "../../../../services/wallet";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/admin/stats");
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deposits = getAllDeposits();
  const balances = getAllBalances();
  const transactions = getAllTransactions();
  const orders = getAllOrders();

  const totalDeposited = deposits
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.amount, 0);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return NextResponse.json({
    deposits,
    balances,
    transactions: transactions.slice(0, 100),
    orders: orders.slice(0, 200),
    stats: {
      totalDeposits: deposits.length,
      paidDeposits: deposits.filter((d) => d.status === "paid").length,
      totalDeposited,
      totalOrders: orders.length,
      totalRevenue,
      totalUsers: balances.length,
      totalTransactions: transactions.length
    }
  });
}
