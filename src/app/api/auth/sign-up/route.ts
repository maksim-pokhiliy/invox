import { NextResponse } from "next/server";

import { features } from "@app/shared/config/features";
import { signUpSchema } from "@app/shared/schemas";

import { createUser, EmailExistsError } from "@app/server/auth/signup";

export async function POST(request: Request) {
  try {
    if (!features.publicRegistration) {
      return NextResponse.json(
        { error: { code: "REGISTRATION_DISABLED", message: "Registration is not available" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

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

    const { email, password } = parsed.data;

    await createUser(email, password);

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch (error) {
    if (error instanceof EmailExistsError) {
      return NextResponse.json(
        {
          error: {
            code: "EMAIL_EXISTS",
            message: error.message,
          },
        },
        { status: 409 }
      );
    }

    console.error("Sign-up error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
