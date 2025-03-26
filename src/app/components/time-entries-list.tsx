"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type Company, type TimeEntry } from "@prisma/client";

interface TimeEntryWithCompany extends TimeEntry {
  company: Company;
}

export default function TimeEntriesList() {
  // const utils = api.useUtils();
  const queryResult = api.timeEntries.get.useQuery();

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading rates</div>;
  }
  const entries: TimeEntryWithCompany[] = queryResult.data ?? [];
  console.log("entries TimeEntry", entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between">
              {/* Date display */}
              <span>
                {new Date(entry.date).toLocaleDateString("en-AU", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>{entry.company.name}</span>

              {/* Time display */}
              <span>
                {new Date(entry.startTime).toLocaleTimeString("en-AU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}{" "}
                -{" "}
                {new Date(entry.endTime).toLocaleTimeString("en-AU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
