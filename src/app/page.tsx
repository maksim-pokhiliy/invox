import { redirect } from "next/navigation";
import { auth } from "@app/server/auth";
import { LandingPage } from "@app/features/landing/components/landing-page";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/app");
  }

  return <LandingPage />;
}
