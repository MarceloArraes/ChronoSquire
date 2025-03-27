/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type Company, type HourlyRate } from "@prisma/client";
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
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
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

  const handleEdit = (dayOfWeek: number, isNight: boolean) => {
    if (!queryResult.data) return;
    const existingRate = rates.find((r) => {
      return r.dayOfWeek === dayOfWeek && r.isNightShift === isNight;
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setRate(existingRate?.rate?.toString() ?? "");
    setEditingDay(dayOfWeek);
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
  console.log("hourly Rate", rates);
  console.log("companies", companies);
  return (
    <Card className="mx-auto max-w-2xl bg-white/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Hourly Rates</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Select
          defaultValue={companyId ?? ""}
          onValueChange={(e) => {
            console.log("e", e);
            setCompanyId(e);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Companies</SelectLabel>
              {companies.map((company) => {
                return (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="space-y-4">
            <div className="border-b border-amber-700/30 pb-2">
              <h3 className="text-base font-medium text-foreground">{day}</h3>
            </div>

            {/* Day Shift */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 px-2">
                <span className="text-sm text-muted-foreground">Day Shift</span>
                <div className="flex items-center gap-2">
                  {editingDay === index && !isNightShift ? (
                    <>
                      <Input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="h-8 w-24 text-right"
                        placeholder="0.00"
                      />
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!companyId}
                        className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="w-24 text-right font-mono">
                        $
                        {rates
                          .find((r) => r.dayOfWeek === index && !r.isNightShift)
                          ?.rate.toString() ?? "—"}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!companyId}
                        size="sm"
                        onClick={() => handleEdit(index, false)}
                        className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Night Shift */}
              <div className="flex items-center justify-between gap-4 px-2">
                <span className="text-sm text-muted-foreground">
                  Night Shift
                </span>
                <div className="flex items-center gap-2">
                  {editingDay === index && isNightShift ? (
                    <>
                      <Input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="h-8 w-24 text-right"
                        placeholder="0.00"
                      />
                      <Button
                        disabled={!companyId}
                        size="sm"
                        onClick={handleSave}
                        className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="w-24 text-right font-mono">
                        $
                        {rates
                          .find((r) => r.dayOfWeek === index && r.isNightShift)
                          ?.rate.toString() ?? "—"}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!companyId}
                        size="sm"
                        className="rounded-md border border-amber-700 bg-amber-100 px-4 py-2 font-serif text-sm italic tracking-wide text-amber-900 shadow-sm transition duration-150 hover:bg-amber-200 hover:shadow-md"
                        onClick={() => handleEdit(index, true)}
                      >
                        Edit
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
