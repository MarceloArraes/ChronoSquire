// TimeEntryForm (time-entry-form.tsx)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { CalendarIcon, ClockIcon, Building2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Company } from "@prisma/client";

export default function TimeEntryForm() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakMinutes, setBreakMinutes] = useState<number | null>(30);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  // Fetch companies
  const {
    data: companies,
    isLoading,
    isError,
  } = api.companies.getAll.useQuery();
  const utils = api.useUtils();

  const { mutate: upsertTimeEntry } = api.timeEntries.upsert.useMutation({
    onSuccess: () => {
      void utils.timeEntries.invalidate();
      setDate("");
      setStartTime("");
      setEndTime("");
      setBreakMinutes(null);
      setSelectedCompanyId("");
      toast.success("Time entry saved successfully!", {
        position: "top-center",
        duration: 3000,
      });
    },
    onError: () => {
      toast.error("Failed to save time entry", {
        position: "top-center",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    if (new Date(`${date}T${endTime}`) <= new Date(`${date}T${startTime}`)) {
      toast.error("End time must be after start time");
      return;
    }

    upsertTimeEntry({
      date,
      startTime,
      endTime,
      breakMinutes: breakMinutes ?? 0,
      companyId: selectedCompanyId,
    });
  };

  if (isError || isLoading) {
    return <div> Loading... or error</div>;
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-5"
    >
      {/* Company Selector */}
      <div className="space-y-2">
        <Label
          htmlFor="company"
          className="flex items-center gap-2 text-gray-600"
        >
          <Building2Icon className="h-4 w-4" />
          Company
        </Label>
        <Select
          value={selectedCompanyId}
          onValueChange={setSelectedCompanyId}
          required
        >
          <SelectTrigger className="h-12 text-lg">
            <SelectValue placeholder="Select company..." />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem disabled value="loading">
                Loading companies...
              </SelectItem>
            ) : companies?.length ? (
              companies?.map((company: Company) => (
                <SelectItem key={company?.id} value={company?.id}>
                  {company?.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="no-companies">
                No companies available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Date Input */}
      <div className="space-y-2">
        <Label htmlFor="date" className="flex items-center gap-2 text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="h-12 text-lg"
        />
      </div>

      {/* Start Time */}
      <div className="space-y-2">
        <Label
          htmlFor="startTime"
          className="flex items-center gap-2 text-gray-600"
        >
          <ClockIcon className="h-4 w-4" />
          Start Time
        </Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          className="h-12 text-lg"
        />
      </div>

      {/* End Time */}
      <div className="space-y-2">
        <Label
          htmlFor="endTime"
          className="flex items-center gap-2 text-gray-600"
        >
          <ClockIcon className="h-4 w-4" />
          End Time
        </Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          className="h-12 text-lg"
        />
      </div>

      {/* Break Time */}
      <div className="space-y-2">
        <Label
          htmlFor="breakTime"
          className="flex items-center gap-2 text-gray-600"
        >
          <ClockIcon className="h-4 w-4" />
          Break (minutes)
        </Label>
        <Input
          id="breakTime"
          type="number"
          min="0"
          value={breakMinutes?.toString()}
          onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
          placeholder={"30"}
          className="h-12 text-lg"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-end">
        <Button
          type="submit"
          className="h-12 w-full bg-primary text-lg font-semibold hover:bg-primary/90"
        >
          Add Entry
        </Button>
      </div>
    </form>
  );
}
