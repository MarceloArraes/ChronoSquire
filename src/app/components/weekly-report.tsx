"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type TimeEntry } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  return new Date(d.setDate(diff));
};

// Helper function to get end of week (Sunday)
const getEndOfWeek = (date: Date) => {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

export default function WeeklyReport() {
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState<string | undefined>("");
  const [endDate, setEndDate] = useState<string | undefined>("");

  // Set initial dates from URL params
  useEffect(() => {
    const today = new Date();
    const defaultStart = getStartOfWeek(today).toISOString().split("T")[0];
    const defaultEnd = getEndOfWeek(today).toISOString().split("T")[0];

    setStartDate(searchParams.get("start-date") ?? defaultStart);
    setEndDate(searchParams.get("end-date") ?? defaultEnd);
  }, [searchParams]);

  const queryResult = api.timeEntries.getByWeek.useQuery({
    initialDate: startDate, // Fixed parameter name here
    endDate: endDate,
  });
  // const utils = api.useUtils();

  const entries: TimeEntry[] = queryResult.data ?? [];
  // const rates: HourlyRate[] = hourlyQueryResult.data ?? [];
  console.log("entries", entries);

  const calculateTotalHours = () => {
    const total = entries.reduce((total, entry) => {
      try {
        if (!entry.entryDate || !entry.startDateTime || !entry.endDateTime)
          return total;
        if (!entry.totalTime) return total;

        return total + Number(entry.totalTime);
      } catch (error) {
        console.error("Invalid entry:", entry, error);
        return total;
      }
    }, 0);
    return total.toFixed(2);
  };
  console.log("calculateTotalHours", calculateTotalHours());

  const calculateTotalEarnings = () => {
    const earningTotal = entries.reduce((total, entry) => {
      try {
        if (!entry.earnings) return total;

        return total + Number(entry.earnings.toString());
      } catch (error) {
        console.error("Invalid entry:", entry, error);
        return total;
      }
    }, 0);
    return earningTotal.toFixed(2);
  };

  console.log("calculateTotalHours()", calculateTotalHours());

  const handleRefresh = () => {
    void queryResult.refetch();
  };

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading time entries</div>;
  }

  return (
    <Card className="border-amber-700/30 bg-white/50 shadow-md">
      <CardHeader className="border-b border-amber-700/30">
        <CardTitle className="font-serif italic text-amber-950">
          Weekly Tally of Labors
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex justify-between gap-4">
          <div className="w-1/2">
            <label
              htmlFor="startDate"
              className="block font-serif text-sm italic text-amber-900"
            >
              First Day of Reckoning
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-amber-700/30 bg-amber-50 p-2 font-serif shadow-inner focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>
          <div className="w-1/2">
            <label
              htmlFor="endDate"
              className="block font-serif text-sm italic text-amber-900"
            >
              Final Day of Reckoning
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-amber-700/30 bg-amber-50 p-2 font-serif shadow-inner focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
            />
          </div>
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
            className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
          >
            Refresh Thy Tally
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
