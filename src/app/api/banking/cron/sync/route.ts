import { NextResponse } from "next/server";
import { syncAllConnections } from "@app/server/banking/sync";

export async function POST(request: Request) {
  try {
    const cronSecret = request.headers.get("x-cron-secret");

    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
        { status: 401 }
      );
    }

    await syncAllConnections();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Sync failed" } },
      { status: 500 }
    );
  }
}
