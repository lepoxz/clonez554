import { NextResponse } from "next/server";
import { getClone282MenuData } from "../../../../services/catalog-data";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await getClone282MenuData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to fetch menu" }, { status: 500 });
  }
}
