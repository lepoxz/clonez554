import { NextResponse } from "next/server";
import { getClone282ProductsData } from "../../../../services/catalog-data";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await getClone282ProductsData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to fetch products" }, { status: 500 });
  }
}
