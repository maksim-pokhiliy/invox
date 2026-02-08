import { NextResponse } from "next/server";
import { getSenderProfile, upsertSenderProfile } from "@app/server/sender-profile";
import { createSenderProfileSchema } from "@app/shared/schemas";
import { withAuth, parseBody, notFoundResponse } from "@app/shared/api/route-helpers";

export const GET = withAuth(async (user) => {
  const profile = await getSenderProfile(user.id);

  if (!profile) {
    return notFoundResponse("Sender profile");
  }

  return NextResponse.json(profile);
});

export const POST = withAuth(async (user, request) => {
  const { data, error } = await parseBody(request, createSenderProfileSchema);

  if (error) {
    return error;
  }

  const profile = await upsertSenderProfile(user.id, data);
  return NextResponse.json(profile, { status: 201 });
});

export const PUT = withAuth(async (user, request) => {
  const { data, error } = await parseBody(request, createSenderProfileSchema);

  if (error) {
    return error;
  }

  const profile = await upsertSenderProfile(user.id, data);
  return NextResponse.json(profile);
});
