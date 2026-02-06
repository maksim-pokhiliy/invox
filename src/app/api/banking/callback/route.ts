import { NextResponse } from "next/server";
import { handleCallback } from "@app/server/banking/connections";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await handleCallback(body);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Banking callback error:", error);
    return NextResponse.json({ received: true });
  }
}
