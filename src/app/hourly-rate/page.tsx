import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import HourlyRateManager from "../components/hourly-rate-manager";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <div>
      <Link href={"/"}>
        <h1 className="mb-8 text-4xl font-bold">Hourly Rate</h1>
      </Link>
      <HourlyRateManager />
      <Link
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        {session ? "Sign out" : "Sign in"}
      </Link>
    </div>
  );
}
