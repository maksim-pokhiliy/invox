import { NextResponse } from "next/server";
import { requireUser } from "@app/server/auth/require-user";
import { getAnalytics } from "@app/server/analytics";

export async function GET() {
  const user = await requireUser();
  const analytics = await getAnalytics(user.id);
  return NextResponse.json(analytics);
}
