"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type TimeEntry } from "@prisma/client";
import { useSearchParams } from "next/navigation";

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
  const hourlyQueryResult = api.hourlyRate.get.useQuery();

  const entries: TimeEntry[] = queryResult.data ?? [];
  // const rates: HourlyRate[] = hourlyQueryResult.data ?? [];
  console.log("entries", entries);

  const calculateTotalHours = () => {
    return entries.reduce((total, entry) => {
      try {
        if (!entry.date || !entry.startTime || !entry.endTime) return total;
        if (!entry.totalTime) return total;

        return total + Number(entry.totalTime.toFixed(2));
      } catch (error) {
        console.error("Invalid entry:", entry, error);
        return total;
      }
    }, 0);
  };

  const calculateTotalEarnings = () => {
    return entries.reduce((total, entry) => {
      try {
        if (!entry.earnings) return total;

        return total + Number(entry.earnings.toFixed(2));
      } catch (error) {
        console.error("Invalid entry:", entry, error);
        return total;
      }
    }, 0);
  };

  console.log("calculateTotalHours()", calculateTotalHours());

  const handleRefresh = () => {
    void queryResult.refetch();
    void hourlyQueryResult.refetch();
  };

  if (queryResult.isLoading || hourlyQueryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading time entries</div>;
  }

  if (hourlyQueryResult.isError) {
    return <div>Error loading rates</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="space-y-4">
          <p>
            <strong>Total Hours Worked:</strong>{" "}
            {calculateTotalHours().toFixed(2)} hours
          </p>
          <p>
            <strong>Total Earnings:</strong> $
            {calculateTotalEarnings().toFixed(2)}
          </p>
        </div>
        <Button onClick={handleRefresh} className="mt-4">
          Refresh Report
        </Button>
      </CardContent>
    </Card>
  );
}
