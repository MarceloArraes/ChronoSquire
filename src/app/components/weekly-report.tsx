// src/app/reports/weekly/page.tsx (or similar path)
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type Decimal } from "@prisma/client/runtime/library";

// --- CLIENT-SIDE HELPERS to determine the week for DISPLAY purposes ---
// Your backend already does this for the query, but we need it on the client
// to show the user the correct date range.

// Helper to get start of week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // Sunday = 0, Monday = 1, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  return new Date(d.setDate(diff));
};

// Helper to get end of week (Sunday)
const getEndOfWeek = (date: Date): Date => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

// Helper to format a Date object into "YYYY-MM-DD"
const toYYYYMMDD = (date: Date): string => {
  return date.toISOString().split("T")[0] || "";
};

export default function WeeklyReport() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- REFACTORED STATE ---
  // We only need ONE date to represent the week the user is interested in.
  const [selectedDate, setSelectedDate] = useState<string>("");

  // --- EFFECT FOR INITIALIZATION ---
  // On component mount, set the selected date from the URL or default to today.
  useEffect(() => {
    const dateFromUrl = searchParams.get("date");
    // Use the date from the URL if it exists, otherwise default to today.
    setSelectedDate(dateFromUrl ?? toYYYYMMDD(new Date()));
  }, [searchParams]);

  // --- REFACTORED TRPC QUERY ---
  // The query now depends on our single `selectedDate` state.
  const queryResult = api.timeEntries.getByWeek.useQuery(
    {
      // The input object now matches the backend expectation.
      dateInWeek: selectedDate,
    },
    {
      // VERY IMPORTANT: This prevents the query from running if `selectedDate` is
      // still an empty string (e.g., on the very first render before useEffect runs).
      enabled: !!selectedDate,
    },
  );

  // --- DERIVED VALUES FOR DISPLAY ---
  // Calculate the week's start and end dates for showing them in the UI.
  const weekStartsOn = selectedDate
    ? toYYYYMMDD(getStartOfWeek(new Date(selectedDate)))
    : "...";
  const weekEndsOn = selectedDate
    ? toYYYYMMDD(getEndOfWeek(new Date(selectedDate)))
    : "...";

  // --- DATA & CALCULATIONS ---
  // The Prisma `Decimal` type can be tricky. We ensure it's handled safely.
  const entries = queryResult.data ?? [];

  const calculateTotalHours = (): string => {
    const total = entries.reduce((sum, entry) => {
      // The `totalTime` from Prisma is a Decimal object, which serializes to a string.
      const hours = Number(entry.totalTime ?? 0);
      return sum + hours;
    }, 0);
    return total.toFixed(2);
  };

  const calculateTotalEarnings = (): string => {
    const total = entries.reduce((sum, entry) => {
      // The `earnings` is also a Decimal.
      const earnings = Number(entry.earnings ?? 0);
      return sum + earnings;
    }, 0);
    return total.toFixed(2);
  };

  // --- EVENT HANDLERS ---
  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    // Update the URL to reflect the new date selection.
    // This makes the page's state shareable via its URL.
    router.push(`${pathname}?date=${newDate}`);
  };

  const handleRefresh = () => {
    // `refetch` is the correct function to re-run the query.
    void queryResult.refetch();
  };

  if (queryResult.isLoading && !queryResult.data) {
    return <div>Loading thy scrolls...</div>;
  }

  if (queryResult.isError) {
    return <div>Error! The royal chronicler has failed to tally the labors.</div>;
  }

  return (
    <Card className="border-amber-700/30 bg-white/50 shadow-md">
      <CardHeader className="border-b border-amber-700/30">
        <CardTitle className="font-serif italic text-amber-950">
          Weekly Tally of Labors
        </CardTitle>
        <CardDescription className="pt-1 font-serif text-amber-900">
          Showing tally for the week of: {weekStartsOn} to {weekEndsOn}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <label
            htmlFor="selectedDate"
            className="block font-serif text-sm italic text-amber-900"
          >
            Select a Day to Reckon Its Week
          </label>
          <input
            type="date"
            id="selectedDate"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-amber-700/30 bg-amber-50 p-2 font-serif shadow-inner focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </div>

        <div className="space-y-4 rounded-md border border-amber-700/30 bg-amber-100/50 p-4 shadow-inner">
          <p className="font-serif italic text-amber-900">
            <span className="font-semibold">Total Hours of Toil:</span>{" "}
            {calculateTotalHours()} hours
          </p>
          <p className="font-serif italic text-amber-900">
            <span className="font-semibold">Gold Earned:</span>{" "}
            {calculateTotalEarnings()} crowns
          </p>
        </div>

        <div className="mt-6 flex justify-between">
          <Link
            href="/"
            className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
          >
            Return to Thy Ledger
          </Link>

          <Button
            onClick={handleRefresh}
            disabled={queryResult.isFetching}
            className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {queryResult.isFetching ? "Tallying..." : "Refresh Thy Tally"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}