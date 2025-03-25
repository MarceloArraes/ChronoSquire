// Home Page (page.tsx)
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import Link from "next/link";
import TimeEntriesList from "../components/time-entries-list";
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <nav className="mb-12 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Time Tracker</h1>
        <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 shadow-sm transition-all hover:shadow-md"
        >
          {session ? (
            <>
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign out</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span className="font-medium">Sign in</span>
            </>
          )}
        </Link>
      </nav>

      <main className="mx-auto max-w-4xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="h-6 w-6 text-primary" />
              New Time Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <TimeEntryForm />
          </CardContent>
        </Card>

        <Separator className="my-8 bg-gray-200" />

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Clock className="h-6 w-6 text-primary" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <TimeEntriesList />
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-500">Showing last 30 entries</p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
