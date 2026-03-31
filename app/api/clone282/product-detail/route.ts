import { NextRequest, NextResponse } from "next/server";
import { CLONE282_REVALIDATE, getClone282ProductDetail } from "../../../../lib/clone282";

export const revalidate = CLONE282_REVALIDATE;

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const token = request.nextUrl.searchParams.get("token") ?? "";

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const detail = await getClone282ProductDetail(id, token);
    return NextResponse.json({ detail, source: "clone282" });
  } catch {
    return NextResponse.json({ error: "Unable to fetch product detail" }, { status: 500 });
  }
}
