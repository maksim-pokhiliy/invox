import { NextResponse } from "next/server";

import type { ZodType } from "zod";

import { API_ERROR_CODES, type ApiErrorCode } from "@app/shared/api/error-codes";
import { env } from "@app/shared/config/env";

import { AuthenticationError, type AuthUser, requireUser } from "@app/server/auth/require-user";

export type { AuthUser };

export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

export function unauthorizedResponse() {
  return errorResponse(API_ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
}

export function validationErrorResponse(zodError: { issues: Array<{ message: string }> }) {
  return errorResponse(
    API_ERROR_CODES.VALIDATION_ERROR,
    zodError.issues[0]?.message ?? "Invalid input",
    400
  );
}

export function notFoundResponse(entity: string) {
  return errorResponse(API_ERROR_CODES.NOT_FOUND, `${entity} not found`, 404);
}

export function forbiddenResponse() {
  return errorResponse(API_ERROR_CODES.FORBIDDEN, "Access denied", 403);
}

export function internalErrorResponse() {
  return errorResponse(API_ERROR_CODES.INTERNAL_ERROR, "An unexpected error occurred", 500);
}

interface ErrorHandler {
  check: (error: unknown) => boolean;
  respond: (error: Error) => NextResponse;
}

export type RouteContext = { params: Promise<Record<string, string>> };

export type AuthHandler = (
  user: AuthUser,
  request: Request,
  context: RouteContext
) => Promise<NextResponse>;

export function withAuth(handler: AuthHandler, errorHandlers?: ErrorHandler[]) {
  return async (request: Request, context: RouteContext) => {
    try {
      const user = await requireUser();

      return await handler(user, request, context);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return unauthorizedResponse();
      }

      if (errorHandlers) {
        for (const { check, respond } of errorHandlers) {
          if (check(error)) {
            return respond(error as Error);
          }
        }
      }

      console.error(error);

      return internalErrorResponse();
    }
  };
}

export function withAdmin(handler: AuthHandler, errorHandlers?: ErrorHandler[]) {
  return withAuth(async (user, request, context) => {
    if (!env.ADMIN_EMAIL || user.email !== env.ADMIN_EMAIL) {
      return forbiddenResponse();
    }

    return handler(user, request, context);
  }, errorHandlers);
}

type PublicHandler = (request: Request, context: RouteContext) => Promise<NextResponse>;

export function withPublic(handler: PublicHandler, errorHandlers?: ErrorHandler[]) {
  return async (request: Request, context: RouteContext) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (errorHandlers) {
        for (const { check, respond } of errorHandlers) {
          if (check(error)) {
            return respond(error as Error);
          }
        }
      }

      console.error(error);

      return internalErrorResponse();
    }
  };
}

export async function parseBody<T>(request: Request, schema: ZodType<T>) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      data: null as never,
      error: validationErrorResponse({ issues: [{ message: "Invalid JSON body" }] }),
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return { data: null as never, error: validationErrorResponse(parsed.error) };
  }

  return { data: parsed.data, error: null };
}
