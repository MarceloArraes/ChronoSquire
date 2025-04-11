"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type Company, type TimeEntry } from "@prisma/client";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface TimeEntryWithCompany extends TimeEntry {
  company: Company;
}

type DailyEntrySummary = {
  totalHours: number;
  totalEarnings: number;
  entries: TimeEntryWithCompany[];
};

export default function TimeEntriesCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch time entries
  const queryResult = api.timeEntries.get.useQuery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entries: TimeEntryWithCompany[] = queryResult.data ?? [];

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const groupedEntries = new Map<string, DailyEntrySummary>();

    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.entryDate), "yyyy-MM-dd");

      if (!groupedEntries.has(dateKey)) {
        groupedEntries.set(dateKey, {
          totalHours: 0,
          totalEarnings: 0,
          entries: [],
        });
      }

      const summary = groupedEntries.get(dateKey)!;
      summary.entries.push(entry);
      summary.totalHours += Number(entry.totalTime);
      summary.totalEarnings += Number(entry.earnings);

      // Update with rounded values
      summary.totalHours = Math.round(summary.totalHours * 100) / 100;
      summary.totalEarnings = Math.round(summary.totalEarnings * 100) / 100;
    });

    return groupedEntries;
  }, [entries]);

  // Get entries for the selected day
  const selectedDayEntries = useMemo(() => {
    if (!selectedDay) return null;

    const dateKey = format(selectedDay, "yyyy-MM-dd");
    return entriesByDate.get(dateKey) ?? null;
  }, [selectedDay, entriesByDate]);

  // Function to handle day click
  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setSelectedDay(day);
      setIsDialogOpen(true);
    }
  };

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading time entries</div>;
  }

  // Custom day rendering for the calendar
  // const dayContent = (day: Date) => {
  //   const dateKey = format(day, "yyyy-MM-dd");
  //   const summary = entriesByDate.get(dateKey);

  //   if (!summary) return null;

  //   return (
  //     <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-sm leading-tight">
  //       <div className="font-medium text-primary">${summary.totalEarnings}</div>
  //       <div className="text-muted-foreground">{summary.totalHours}h</div>
  //     </div>
  //   );
  // };

  return (
    <Card className="border-amber-700/30 bg-white/50 shadow-md">
      <CardHeader className="border-b border-amber-700/30">
        <CardTitle className="font-serif italic text-amber-950">
          Time Entries Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          selected={selectedDay}
          onSelect={handleDayClick}
          className="flex justify-center rounded-md border border-amber-700/30"
          modifiers={{
            hasEntries: (date) => {
              const dateKey = format(date, "yyyy-MM-dd");
              return entriesByDate.has(dateKey);
            },
          }}
          modifiersClassNames={{
            hasEntries: "relative has-entries",
          }}
          components={{
            DayContent: (props) => {
              const dateStr = format(props.date, "yyyy-MM-dd");
              const summary = entriesByDate.get(dateStr);

              return (
                <div className="relative h-full w-full">
                  <div className="text-lg">{props.date.getDate()}</div>
                  {summary && (
                    <div className="pointer-events-none absolute inset-2 items-center justify-center pt-5 text-[0.6rem] leading-tight sm:text-sm">
                      <div className="font-medium focus:text-primary-foreground">
                        ${summary.totalEarnings}
                      </div>
                      <div className="text-muted-foreground">
                        {summary.totalHours}h
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          }}
        />

        {/* Day detail dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDay && format(selectedDay, "EEEE, MMMM d, yyyy")}
              </DialogTitle>
            </DialogHeader>

            {selectedDayEntries ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Hours:</span>
                  <span>{selectedDayEntries.totalHours}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Earnings:</span>
                  <span>${selectedDayEntries.totalEarnings}</span>
                </div>

                <ScrollArea className="max-h-60">
                  <div className="space-y-3">
                    {selectedDayEntries.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md border border-amber-700/30 bg-muted/50 p-3"
                      >
                        <div className="mb-1 flex justify-between">
                          <span className="font-medium">
                            {entry.company.name}
                          </span>
                          <span>${Number(entry.earnings)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.startDateTime).toLocaleTimeString(
                            "en-AU",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )}{" "}
                          -{" "}
                          {new Date(entry.endDateTime).toLocaleTimeString(
                            "en-AU",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )}
                          {entry.breakMinutes > 0 &&
                            ` (${entry.breakMinutes}min break)`}
                        </div>
                        <div className="mt-1 text-sm">
                          {Number(entry.totalTime)}h
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No time entries for this day
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
