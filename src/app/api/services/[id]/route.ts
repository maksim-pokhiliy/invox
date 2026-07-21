import { NextResponse } from "next/server";

import { updateServiceSchema } from "@app/shared/schemas";
import { asServiceId } from "@app/shared/types/ids";

import {
  errorResponse,
  notFoundResponse,
  parseBody,
  withAuth,
} from "@app/server/api/route-helpers";
import { deleteService, getService, ServiceInUseError, updateService } from "@app/server/services";

const serviceInUseHandler = {
  check: (error: unknown) => error instanceof ServiceInUseError,
  respond: (error: Error) => {
    const dependents = error as ServiceInUseError;

    return errorResponse(
      "SERVICE_IN_USE",
      `Cannot delete service used by ${dependents.invoiceItemCount} invoice item(s). Deactivate it instead.`,
      409,
      { invoiceItemCount: dependents.invoiceItemCount }
    );
  },
};

export const GET = withAuth(async (user, _request, context) => {
  const { id } = await context.params;
  const service = await getService(asServiceId(id), user.id);

  if (!service) {
    return notFoundResponse("Service");
  }

  return NextResponse.json(service);
});

export const PATCH = withAuth(async (user, request, context) => {
  const { id } = await context.params;
  const { data, error } = await parseBody(request, updateServiceSchema);

  if (error) {
    return error;
  }

  const service = await updateService(asServiceId(id), user.id, data);

  if (!service) {
    return notFoundResponse("Service");
  }

  return NextResponse.json(service);
});

export const DELETE = withAuth(
  async (user, _request, context) => {
    const { id } = await context.params;
    const result = await deleteService(asServiceId(id), user.id);

    if (!result) {
      return notFoundResponse("Service");
    }

    return NextResponse.json({ success: true });
  },
  [serviceInUseHandler]
);
