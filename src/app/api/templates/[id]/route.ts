import { NextResponse } from "next/server";

import { updateTemplateSchema } from "@app/shared/schemas";

import { notFoundResponse, parseBody, withAuth } from "@app/server/api/route-helpers";
import { deleteTemplate, getTemplate, updateTemplate } from "@app/server/templates";

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const template = await getTemplate(id, user.id);

  if (!template) {
    return notFoundResponse("Template");
  }

  return NextResponse.json(template);
});

export const PATCH = withAuth(async (user, request, context) => {
  const { id } = await context.params;
  const { data, error } = await parseBody(request, updateTemplateSchema);

  if (error) {
    return error;
  }

  const template = await updateTemplate(id, user.id, data);

  if (!template) {
    return notFoundResponse("Template");
  }

  return NextResponse.json(template);
});

export const DELETE = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const result = await deleteTemplate(id, user.id);

  if (!result) {
    return notFoundResponse("Template");
  }

  return NextResponse.json({ success: true });
});
