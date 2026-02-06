import { NextResponse } from "next/server";
import { requireUser, AuthenticationError } from "@app/server/auth/require-user";
import { deleteConnectionById } from "@app/server/banking/connections";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const result = await deleteConnectionById(id, user.id);

    if (!result) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Connection not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }
    console.error("Delete bank connection error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
