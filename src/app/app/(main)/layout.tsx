import { redirect } from "next/navigation";
import { auth } from "@app/server/auth";
import { prisma } from "@app/server/db";

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const senderProfile = await prisma.senderProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!senderProfile) {
    redirect("/app/onboarding");
  }

  return <>{children}</>;
}
