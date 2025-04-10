"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type Company, type TimeEntry } from "@prisma/client";
import { format } from "date-fns";

interface TimeEntryWithCompany extends TimeEntry {
  company: Company;
}

export default function TimeEntriesList() {
  // Fetch time entries
  const queryResult = api.timeEntries.get.useQuery();
  const entries: TimeEntryWithCompany[] = queryResult.data ?? [];

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading time entries</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Time Scrolls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-700/30 text-sm">
            <thead className="bg-amber-50/80">
              <tr>
                <th className="px-4 py-2 text-left font-serif italic text-amber-900">
                  Date
                </th>
                <th className="px-4 py-2 text-left font-serif italic text-amber-900">
                  Start Time
                </th>
                <th className="px-4 py-2 text-left font-serif italic text-amber-900">
                  End Time
                </th>
                <th className="px-4 py-2 text-left font-serif italic text-amber-900">
                  Company
                </th>
                <th className="px-4 py-2 text-left font-serif italic text-amber-900">
                  Total Time
                </th>
                <th className="px-4 py-2 text-left font-serif italic text-amber-900">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-700/30">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="bg-white/50 transition-colors hover:bg-amber-100/50"
                >
                  <td className="px-4 py-2">
                    {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                  </td>
                  <td className="px-4 py-2">
                    {format(new Date(entry.startTime), "HH:mm")}
                  </td>
                  <td className="px-4 py-2">
                    {format(new Date(entry.endTime), "HH:mm")}
                  </td>

                  <td className="px-4 py-2">{entry.company.name}</td>
                  <td className="px-4 py-2">{Number(entry.totalTime)}h</td>
                  <td className="px-4 py-2">${Number(entry.earnings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
