import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import type { ZodType } from "zod";

type ErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR"
  | (string & {});

export function errorResponse(code: ErrorCode, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function unauthorizedResponse() {
  return errorResponse("UNAUTHORIZED", "Unauthorized", 401);
}

export function validationErrorResponse(zodError: { issues: Array<{ message: string }> }) {
  return errorResponse("VALIDATION_ERROR", zodError.issues[0]?.message ?? "Invalid input", 400);
}

export function notFoundResponse(entity: string) {
  return errorResponse("NOT_FOUND", `${entity} not found`, 404);
}

export function internalErrorResponse() {
  return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
}

interface ErrorHandler {
  check: (error: unknown) => boolean;
  respond: (error: Error) => NextResponse;
}

type AuthUser = { id: string; email: string };

type RouteContext = { params: Promise<Record<string, string>> };

type AuthHandler = (
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

export async function parseBody<T>(request: Request, schema: ZodType<T>) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { data: null as never, error: validationErrorResponse(parsed.error) };
  }
  return { data: parsed.data, error: null };
}
