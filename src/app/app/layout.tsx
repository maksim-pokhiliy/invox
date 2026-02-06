import { redirect } from "next/navigation";
import { auth } from "@app/server/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
