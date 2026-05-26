import { NextResponse } from "next/server";

import { API_ERROR_CODES } from "@app/shared/api/error-codes";

const STATUS_GATEWAY_TIMEOUT = 504;

export class RequestBudgetExceededError extends Error {
  constructor(public readonly budgetMs: number) {
    super(`Request exceeded ${budgetMs}ms budget`);
    this.name = "RequestBudgetExceededError";
  }
}

export interface RequestBudget {
  signal: AbortSignal;
  cancel: () => void;
  rethrowIfExceeded: (error: unknown) => never;
}

export function createRequestBudget(budgetMs: number): RequestBudget {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new RequestBudgetExceededError(budgetMs));
  }, budgetMs);

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
    rethrowIfExceeded: (error) => {
      if (controller.signal.aborted) {
        const reason = controller.signal.reason;

        if (reason instanceof RequestBudgetExceededError) {
          throw reason;
        }
      }

      throw error;
    },
  };
}

export function gatewayTimeoutResponse() {
  return NextResponse.json(
    {
      error: {
        code: API_ERROR_CODES.GATEWAY_TIMEOUT,
        message: "Request exceeded the time budget. Try again.",
      },
    },
    { status: STATUS_GATEWAY_TIMEOUT }
  );
}

export function isRequestBudgetExceeded(error: unknown): boolean {
  if (error instanceof RequestBudgetExceededError) {
    return true;
  }

  if (typeof error === "object" && error !== null) {
    const cause = (error as { cause?: unknown }).cause;

    if (cause instanceof RequestBudgetExceededError) {
      return true;
    }
  }

  return false;
}
