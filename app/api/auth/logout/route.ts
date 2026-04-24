import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "../../../../services/auth";
import { isModalEnabled, proxyToModal } from "../../../../services/modal-proxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (isModalEnabled()) return proxyToModal(request, "/auth/logout", { method: "POST" });
  await clearSession();
  return NextResponse.json({ success: true });
}
