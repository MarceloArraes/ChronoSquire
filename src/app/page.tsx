import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Dashboard from "./components/dashboard";
import LoginButton from "./components/login-button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1 className="mb-8 text-4xl font-bold">Time Tracker</h1>
        {session ? <Dashboard user={session.user} /> : <LoginButton />}
        <Link
          href="/hourly-rate"
          className="rounded-md border border-amber-700 bg-amber-50 px-4 py-2 font-serif italic tracking-wide text-amber-900 transition duration-150 hover:bg-amber-100"
        >
          Hourly rates
        </Link>
        <Link
          href="/companies-entry-form"
          className="rounded-md border border-amber-700 bg-amber-50 px-4 py-2 font-serif italic tracking-wide text-amber-900 transition duration-150 hover:bg-amber-100"
        >
          Company Menu
        </Link>
        <Link
          href="/weekly-report"
          className="rounded-md border border-amber-700 bg-amber-50 px-4 py-2 font-serif italic tracking-wide text-amber-900 transition duration-150 hover:bg-amber-100"
        >
          Weekly Report
        </Link>
        <Link
          href="/time-entries"
          className="mt-4 rounded-md border border-amber-700 bg-amber-50 px-4 py-2 font-serif italic tracking-wide text-amber-900 transition duration-150 hover:bg-amber-100"
        >
          Shift List
        </Link>
        <Link
          href="/time-entry-form"
          className="mt-4 rounded-md border border-amber-700 bg-amber-50 px-4 py-2 font-serif italic tracking-wide text-amber-900 transition duration-150 hover:bg-amber-100"
        >
          Shift Menu
        </Link>
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-md border border-amber-700 bg-amber-50 px-4 py-2 font-serif italic tracking-wide text-amber-900 transition duration-150 hover:bg-amber-100"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        </div>
      </main>
    </HydrateClient>
  );
}
