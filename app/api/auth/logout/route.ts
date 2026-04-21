import { NextResponse } from "next/server";
import { clearSession } from "../../../../services/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
