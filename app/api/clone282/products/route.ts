import { NextResponse } from "next/server";
import { CLONE282_REVALIDATE, getClone282ProductsData } from "../../../../lib/clone282";

export const revalidate = CLONE282_REVALIDATE;

export async function GET() {
  try {
    const data = await getClone282ProductsData();
    return NextResponse.json({ ...data, source: "clone282" });
  } catch {
    return NextResponse.json({ error: "Unable to fetch products" }, { status: 500 });
  }
}
