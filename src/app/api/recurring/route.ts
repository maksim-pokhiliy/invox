import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { getRecurringInvoices, createRecurringInvoice } from "@app/server/recurring";

const createRecurringSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  currency: z.string().optional(),
  discount: z
    .object({
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().min(0),
    })
    .optional(),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  dueDays: z.number().min(1).max(365).optional(),
  autoSend: z.boolean().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1, "At least one item is required"),
});

export async function GET() {
  try {
    const user = await requireUser();
    const recurringInvoices = await getRecurringInvoices(user.id);
    return NextResponse.json(recurringInvoices);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Get recurring invoices error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const parsed = createRecurringSchema.safeParse(body);

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

    const recurring = await createRecurringInvoice(user.id, parsed.data);
    return NextResponse.json(recurring, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message === "Client not found") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Client not found" } },
        { status: 404 }
      );
    }
    console.error("Create recurring invoice error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
