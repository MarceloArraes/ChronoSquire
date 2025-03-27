// Home Page (page.tsx)
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import TimeEntriesList from "../components/time-entries-listing";
import TimeEntryForm from "../components/time-entry-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LogOut, LogIn, Calendar, Clock } from "lucide-react";

import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const session = await auth();
  if (session?.user) void api.post.getLatest.prefetch();

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 p-8 md:p-16 lg:p-24">
      <div className="w-full max-w-5xl rounded-lg border-2 border-amber-800/40 bg-amber-50/80 p-6 shadow-lg backdrop-blur-sm md:p-10">
        <nav className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-4xl font-bold italic text-amber-950 md:text-5xl">
            Your Time Tracker Sire
          </h1>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-md border border-amber-700 bg-amber-100 px-3 py-1 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md md:px-4 md:py-2"
          >
            {session ? (
              <>
                <LogOut className="h-5 w-5" />
                <span className="font-serif italic">Depart</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span className="font-serif italic">Declare Thyself</span>
              </>
            )}
          </Link>
        </nav>

        <main className="mx-auto max-w-4xl space-y-8">
          <Card className="border-amber-700/30 bg-white/50 shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl italic text-amber-950">
                <Calendar className="h-6 w-6 text-amber-800" />
                New Time Scroll
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TimeEntryForm />
            </CardContent>
          </Card>

          <Separator className="my-8 bg-amber-200/50" />

          <Card className="border-amber-700/30 bg-white/50 shadow-md">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl italic text-amber-950">
                <Clock className="h-6 w-6 text-amber-800" />
                Recent Time Scrolls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TimeEntriesList />
            </CardContent>
            <CardFooter className="border-t border-amber-700/30 bg-amber-50/50 px-6 py-4">
              <p className="font-serif text-sm italic text-amber-800">
                Showing thy last 30 time scrolls
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    </main>
  );
}
