/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { type HourlyRate } from "@prisma/client";

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
  const [rate, setRate] = useState("");

  const utils = api.useUtils();
  const queryResult = api.hourlyRate.get.useQuery();

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
    if (editingDay === null) return;

    upsertRate({
      day_of_week: editingDay,
      is_night_shift: isNightShift,
      rate: Number.parseFloat(rate),
    });
  };

  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }

  if (queryResult.isError) {
    return <div>Error loading rates</div>;
  }

  const rates: HourlyRate[] = queryResult.data ?? [];

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Hourly Rates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-foreground text-base font-medium">{day}</h3>
            </div>

            {/* Day Shift */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 px-2">
                <span className="text-muted-foreground text-sm">Day Shift</span>
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
                      <Button size="sm" onClick={handleSave}>
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
                        size="sm"
                        onClick={() => handleEdit(index, false)}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Night Shift */}
              <div className="flex items-center justify-between gap-4 px-2">
                <span className="text-muted-foreground text-sm">
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
                      <Button size="sm" onClick={handleSave}>
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
                        size="sm"
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
