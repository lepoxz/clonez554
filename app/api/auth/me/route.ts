import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../services/auth";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/auth/me");
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: session });
}
