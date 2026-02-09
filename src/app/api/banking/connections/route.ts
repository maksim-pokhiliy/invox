import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { getConnections, createConnectSession } from "@app/server/banking/connections";
import { env } from "@app/shared/config/env";

export async function GET() {
  try {
    const user = await requireUser();
    const connections = await getConnections(user.id);
    return NextResponse.json(connections);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Get bank connections error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const returnUrl = body.returnUrl || `${env.APP_URL}/app/banking-return`;

    const session = await createConnectSession(user.id, returnUrl);
    return NextResponse.json({ connectUrl: session.connect_url });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Create connect session error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
