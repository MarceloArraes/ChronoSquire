import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import TimeEntriesList from "../components/time-entries-list";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold">Time Entry</h1>
      <TimeEntriesList />
      <Link
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        {session ? "Sign out" : "Sign in"}
      </Link>
    </div>
  );
}
