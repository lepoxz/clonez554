import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { getBalance, getUserTransactions } from "../../../../services/wallet";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/wallet/balance");
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const balance = getBalance(session.username);
  const transactions = getUserTransactions(session.username).slice(0, 20);

  return NextResponse.json({ balance, transactions, username: session.username });
}
