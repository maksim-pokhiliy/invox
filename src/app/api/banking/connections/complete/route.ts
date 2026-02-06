import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { handleConnectionSuccess, discoverNewConnections } from "@app/server/banking/connections";
import { syncTransactions } from "@app/server/banking/sync";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const { connectionId } = body as { connectionId?: string };

    if (connectionId) {
      const connection = await handleConnectionSuccess(connectionId, user.id);
      try {
        await syncTransactions(connection.id);
      } catch (syncError) {
        console.error("Initial sync failed:", syncError);
      }
      return NextResponse.json(connection);
    }

    const discovered = await discoverNewConnections(user.id);

    for (const conn of discovered) {
      try {
        await syncTransactions(conn.id);
      } catch (syncError) {
        console.error("Initial sync failed:", syncError);
      }
    }

    return NextResponse.json({ discovered: discovered.length });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Complete connection error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
