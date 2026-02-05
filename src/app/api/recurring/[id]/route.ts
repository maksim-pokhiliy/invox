import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import {
  getRecurringInvoice,
  updateRecurringInvoice,
  deleteRecurringInvoice,
} from "@app/server/recurring";

const updateRecurringSchema = z.object({
  name: z.string().min(1).optional(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "CANCELED"]).optional(),
  currency: z.string().optional(),
  discount: z
    .object({
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().min(0),
    })
    .nullable()
    .optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  dueDays: z.number().min(1).max(365).optional(),
  autoSend: z.boolean().optional(),
  nextRunAt: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  endDate: z
    .string()
    .transform((s) => new Date(s))
    .nullable()
    .optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1)
    .optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const recurring = await getRecurringInvoice(user.id, id);

    if (!recurring) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Recurring invoice not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(recurring);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Get recurring invoice error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateRecurringSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
          },
        },
        { status: 400 }
      );
    }

    const recurring = await updateRecurringInvoice(user.id, id, parsed.data);
    return NextResponse.json(recurring);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message === "Recurring invoice not found") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Recurring invoice not found" } },
        { status: 404 }
      );
    }
    console.error("Update recurring invoice error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await deleteRecurringInvoice(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message === "Recurring invoice not found") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Recurring invoice not found" } },
        { status: 404 }
      );
    }
    console.error("Delete recurring invoice error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
