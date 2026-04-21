import { NextRequest, NextResponse } from "next/server";
import { getClone282ProductDetail } from "../../../../services/catalog-data";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const token = request.nextUrl.searchParams.get("token") ?? "";

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const detail = await getClone282ProductDetail(id, token);
    return NextResponse.json({ detail });
  } catch {
    return NextResponse.json({ error: "Unable to fetch product detail" }, { status: 500 });
  }
}
