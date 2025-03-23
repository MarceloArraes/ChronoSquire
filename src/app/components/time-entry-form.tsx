"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

export default function TimeEntryForm() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const utils = api.useUtils();

  const { mutate: upsertTimeEntry } = api.timeEntries.upsert.useMutation({
    onSuccess: () => {
      utils.hourlyRate.invalidate().catch((error) => {
        console.error("Failed to invalidate hourly rate:", error);
      });
      setDate("");
      setStartTime("");
      setEndTime("");
      alert("Time entry added successfully!");
    },
  });

  const handleSave = () => {
    if (date === "") return;
    console.log("date, startTime, endTime", date, startTime, endTime);
    // return;
    upsertTimeEntry({ date, startTime, endTime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      handleSave();
    } catch (error) {
      console.error("Error adding time entry:", error);
      alert("Failed to add time entry. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Add Time Entry</Button>
    </form>
  );
}
