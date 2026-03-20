import { notFound } from "next/navigation";

import { env } from "@app/shared/config/env";

import { requireUser } from "@app/server/auth/require-user";

import { WaitlistPageClient } from "./page-client";

export default async function WaitlistPage() {
  const user = await requireUser();

  if (!env.ADMIN_EMAIL || user.email !== env.ADMIN_EMAIL) {
    notFound();
  }

  return <WaitlistPageClient />;
}
