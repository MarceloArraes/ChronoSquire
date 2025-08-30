/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type Company, type HourlyRate } from "@prisma/client";
import { cn } from "@/lib/utils"; // Import cn utility
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const daysOfWeek = [
  "Weekday",
  "Sunday",
  "Saturday",
  "Holiday"
];

export default function HourlyRateManager() {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [isNightShift, setIsNightShift] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [rate, setRate] = useState("");

  const utils = api.useUtils();
  const queryResult = api.hourlyRate.get.useQuery();
  const companiesQueryResult = api.companies.getAll.useQuery();

  const { mutate: upsertRate } = api.hourlyRate.upsert.useMutation({
    onSuccess: () => {
      utils.hourlyRate.invalidate().catch((error) => {
        console.error("Failed to invalidate hourly rate:", error);
      });
      setEditingDay(null);
      setIsNightShift(false);
      setRate("");
    },
  });

  const handleEdit = (typeOfDay: number, isNight: boolean) => {
    if (!queryResult.data) return;
    const existingRate = rates.find((r) => {
      return r.typeOfDay === typeOfDay && r.isNightShift === isNight;
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setRate(existingRate?.rate?.toString() ?? "");
    setEditingDay(typeOfDay);
    setIsNightShift(isNight);
  };

  const handleSave = () => {
    if (editingDay === null || !companyId) return;

    upsertRate({
      day_of_week: editingDay,
      is_night_shift: isNightShift,
      rate: Number.parseFloat(rate),
      companyId: companyId,
    });
  };

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading rates</div>;
  }

  const rates: HourlyRate[] =
    queryResult.data?.filter((rate) => rate.companyId == companyId) ?? [];
  const companies: Company[] = companiesQueryResult.data ?? [];
  // Removed console logs
  return (
    <Card
      className={cn(
        "mx-auto max-w-3xl",
        "rounded-lg border-2 border-amber-800/40 bg-amber-50/80 p-6 shadow-lg backdrop-blur-sm md:p-10",
      )}
    >
      <CardHeader className={cn("mb-6 border-b-2 border-amber-700/30 pb-4")}>
        <CardTitle
          className={cn(
            "text-center font-serif text-2xl font-bold italic text-amber-950",
          )}
        >
          Rate Decrees
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Center the Select component */}
        <div className="mb-6 flex justify-center">
          <Select
            defaultValue={companyId ?? ""}
            onValueChange={(e) => {
              console.log("e", e);
              setCompanyId(e);
            }}
          >
            {/* Apply medieval button/link styles from page.tsx */}
            <SelectTrigger
              className={cn(
                "w-auto min-w-[180px]",
                "rounded-md border border-amber-700 bg-amber-100 px-3 py-1 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md",
              )}
            >
              <SelectValue placeholder="Select a Guild or Patron" />
            </SelectTrigger>
            {/* Apply medieval nav panel styles from page.tsx */}
            <SelectContent
              className={cn(
                "rounded border border-amber-700/30 bg-amber-100/50 shadow-inner",
              )}
            >
              <SelectGroup>
                {/* Apply medieval nav h2 styles from page.tsx, adjusted */}
                <SelectLabel
                  className={cn(
                    "px-2 py-1.5 font-serif text-lg italic text-amber-900",
                  )}
                >
                  Guilds & Patrons
                </SelectLabel>
                {companies.map((company) => {
                  return (
                    // Apply medieval nav link styles from page.tsx
                    <SelectItem
                      key={company.id}
                      value={company.id}
                      className={cn(
                        "cursor-pointer font-serif text-base italic text-amber-900 hover:text-amber-700",
                      )}
                    >
                      {company.name}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
            {/* Removed duplicate closing tags below */}
          </Select>
        </div>

        {/* Styled Day Sections */}
        {daysOfWeek.map((day, index) => (
          // Add a container for each day with medieval styles, similar to nav panel
          <div
            key={index}
            className={cn(
              "space-y-3 rounded border border-amber-700/20 bg-amber-100/30 p-4 shadow-inner",
            )}
          >
            {/* Style day header like nav h2, centered */}
            <div className="border-b border-amber-700/30 pb-2 text-center">
              <h3 className={cn("font-serif text-xl italic text-amber-900")}>
                {day}
              </h3>
            </div>

            {/* Day Shift */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 px-2">
                {/* Thematic shift label */}
                <span
                  className={cn("font-serif text-sm italic text-amber-800")}
                >
                  Day Shift
                </span>
                <div className="flex items-center gap-2">
                  {editingDay === index && !isNightShift ? (
                    <>
                      {/* Style input with medieval theme */}
                      <Input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className={cn(
                          "h-8 w-24 text-right",
                          "rounded-md border border-amber-700 bg-amber-50 px-2 py-1 font-serif text-sm text-amber-900 shadow-inner focus:border-amber-800 focus:ring-amber-800",
                        )}
                        placeholder="0.00"
                      />
                      {/* Style button like page.tsx button/link */}
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!companyId}
                        className={cn(
                          "rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md",
                        )}
                      >
                        Record {/* Thematic text */}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Style rate display */}
                      <span
                        className={cn(
                          "w-24 text-right font-mono text-amber-950",
                        )}
                      >
                        $
                        {rates
                          .find((r) => r.typeOfDay === index && !r.isNightShift)
                          ?.rate?.toString() ?? "—"}{" "}
                        {/* Added toFixed(2) */}
                      </span>
                      {/* Style button like page.tsx button/link */}
                      <Button
                        variant="outline" // Keep outline variant for edit
                        disabled={!companyId}
                        size="sm"
                        onClick={() => handleEdit(index, false)}
                        className={cn(
                          "rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md",
                        )}
                      >
                        Amend {/* Thematic text */}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Night Shift */}
              <div className="flex items-center justify-between gap-4 px-2">
                {/* Thematic shift label */}
                <span
                  className={cn("font-serif text-sm italic text-amber-800")}
                >
                  Night Shift
                </span>
                <div className="flex items-center gap-2">
                  {editingDay === index && isNightShift ? (
                    <>
                      {/* Style input with medieval theme */}
                      <Input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className={cn(
                          "h-8 w-24 text-right",
                          "rounded-md border border-amber-700 bg-amber-50 px-2 py-1 font-serif text-sm text-amber-900 shadow-inner focus:border-amber-800 focus:ring-amber-800",
                        )}
                        placeholder="0.00"
                      />
                      {/* Style button like page.tsx button/link */}
                      <Button
                        disabled={!companyId}
                        size="sm"
                        onClick={handleSave}
                        className={cn(
                          "rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md",
                        )}
                      >
                        Record {/* Thematic text */}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Style rate display */}
                      <span
                        className={cn(
                          "w-24 text-right font-mono text-amber-950",
                        )}
                      >
                        $
                        {rates
                          .find((r) => r.typeOfDay === index && r.isNightShift)
                          ?.rate?.toString() ?? "—"}{" "}
                        {/* Added toFixed(2) */}
                      </span>
                      {/* Style button like page.tsx button/link */}
                      <Button
                        variant="outline" // Keep outline variant for edit
                        disabled={!companyId}
                        size="sm"
                        className={cn(
                          "rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md",
                        )}
                        onClick={() => handleEdit(index, true)}
                      >
                        Amend {/* Thematic text */}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
