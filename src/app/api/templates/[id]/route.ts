import { NextResponse } from "next/server";
import { getTemplate, updateTemplate, deleteTemplate } from "@app/server/templates";
import { withAuth, parseBody, notFoundResponse } from "@app/shared/api/route-helpers";
import { updateTemplateSchema } from "@app/shared/schemas";

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
