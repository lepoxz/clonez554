import { NextRequest, NextResponse } from "next/server";
import { registerUser, setSession } from "../../../../services/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { displayName, username, password } = (await request.json()) as {
      displayName?: string;
      username?: string;
      password?: string;
    };

    const result = registerUser(displayName ?? "", username ?? "", password ?? "");

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    await setSession(result.user);

    return NextResponse.json({
      success: true,
      user: {
        username: result.user.username,
        role: result.user.role,
        displayName: result.user.displayName
      }
    });
  } catch {
    return NextResponse.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}
