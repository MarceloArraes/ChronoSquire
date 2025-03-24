import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import WeeklyReport from "../components/weekly-report";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <div className="m-10 flex flex-1 flex-col items-center justify-between gap-3">
      <Link href={"/"}>
        <h1 className="mb-8 text-4xl font-bold">Weekly Report</h1>
      </Link>
      <WeeklyReport />
      <Link
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        {session ? "Sign out" : "Sign in"}
      </Link>
    </div>
  );
}
