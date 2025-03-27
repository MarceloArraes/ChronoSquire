import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Dashboard from "./components/dashboard";
import LoginButton from "./components/login-button";
import Link from "next/link";
import TimeEntriesCalendar from "./components/time-entries-calendar";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      {/* Apply a background color/image if desired, e.g., bg-amber-50 or a parchment texture */}
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 p-8 md:p-16 lg:p-24">
        {/* Main container with parchment/medieval styling */}
        <div className="w-full max-w-5xl rounded-lg border-2 border-amber-800/40 bg-amber-50/80 p-6 shadow-lg backdrop-blur-sm md:p-10">
          {/* Header Section */}
          <header className="mb-8 flex w-full flex-col items-center justify-between gap-4 border-b-2 border-amber-700/30 pb-4 md:flex-row md:gap-0">
            <h1 className="font-serif text-4xl font-bold italic text-amber-950 md:text-5xl">
              Chrono Squire
            </h1>
            <div className="flex items-center gap-4">
              {session?.user && <Dashboard user={session.user} />}
              {/* Sign in/out Button */}
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-md border border-amber-700 bg-amber-100 px-3 py-1 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md md:px-4 md:py-2"
              >
                {session ? "Depart" : "Declare Thyself"} {/* Thematic text */}
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="mt-6 w-full">
            {session ? (
              <>
                {/* Navigation Panel */}
                <nav className="mb-8 rounded border border-amber-700/30 bg-amber-100/50 p-4 shadow-inner">
                  <h2 className="mb-3 text-center font-serif text-xl italic text-amber-900">
                    Thy Ledger & Tools
                  </h2>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:gap-x-6">
                    {/* <Link
                      href="/time-entries"
                      className="font-serif text-base italic text-amber-900 underline-offset-4 transition duration-150 hover:text-amber-700 hover:underline"
                    >
                      Time Scrolls
                    </Link> */}
                    <Link
                      href="/time-entry-form"
                      className="font-serif text-base italic text-amber-900 underline-offset-4 transition duration-150 hover:text-amber-700 hover:underline"
                    >
                      New Scroll
                    </Link>
                    <Link
                      href="/weekly-report"
                      className="font-serif text-base italic text-amber-900 underline-offset-4 transition duration-150 hover:text-amber-700 hover:underline"
                    >
                      Weekly Tally
                    </Link>
                    <Link
                      href="/hourly-rate"
                      className="font-serif text-base italic text-amber-900 underline-offset-4 transition duration-150 hover:text-amber-700 hover:underline"
                    >
                      Rate Decrees
                    </Link>
                    <Link
                      href="/companies-entry-form"
                      className="font-serif text-base italic text-amber-900 underline-offset-4 transition duration-150 hover:text-amber-700 hover:underline"
                    >
                      Guilds & Patrons
                    </Link>
                  </div>
                </nav>

                <TimeEntriesCalendar />
              </>
            ) : (
              // Login Prompt
              <div className="flex flex-col items-center justify-center rounded-lg border border-amber-700/30 bg-amber-100/50 p-8 text-center shadow-md">
                <p className="mb-4 font-serif text-lg italic text-amber-900">
                  Pray, declare thyself to manage thy time scrolls.
                </p>
                <LoginButton />{" "}
                {/* Assuming LoginButton is styled appropriately */}
              </div>
            )}
          </div>

          {/* Footer (Optional) */}
          {/* <footer className="mt-12 border-t-2 border-amber-700/30 pt-4 text-center">
            <p className="font-serif text-xs italic text-amber-800">
              Chrono Squire - Recording Time Since Ages Past
            </p>
          </footer> */}
        </div>
      </main>
    </HydrateClient>
  );
}
