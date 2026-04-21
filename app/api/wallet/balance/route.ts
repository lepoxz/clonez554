import { NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { getBalance, getUserTransactions } from "../../../../services/wallet";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const balance = getBalance(session.username);
  const transactions = getUserTransactions(session.username).slice(0, 20);

  return NextResponse.json({ balance, transactions, username: session.username });
}
