"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkSchedule {
  id: number;
  type_of_day: number;
  start_time: string;
  end_time: string;
}

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function ScheduleManager() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    fetchSchedules().catch((err) => {
      console.log("err", err);
    });
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        throw new Error("Failed to fetch schedules");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleEdit = (typeOfDay: number) => {
    const schedule = schedules.find((s) => s.type_of_day === typeOfDay);
    if (schedule) {
      setStartTime(schedule.start_time);
      setEndTime(schedule.end_time);
    } else {
      setStartTime("");
      setEndTime("");
    }
    setEditingDay(typeOfDay);
  };

  const handleSave = async () => {
    if (editingDay === null) return;

    try {
      const method = schedules.some((s) => s.type_of_day === editingDay)
        ? "PUT"
        : "POST";
      const response = await fetch("/api/schedules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_of_day: editingDay,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (response.ok) {
        await fetchSchedules();
        setEditingDay(null);
        setStartTime("");
        setEndTime("");
      } else {
        throw new Error("Failed to save schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="mb-2 flex items-center justify-between">
            <span>{day}</span>
            {editingDay === index ? (
              <>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mr-2 w-24"
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mr-2 w-24"
                />
                <Button onClick={handleSave}>Save</Button>
              </>
            ) : (
              <>
                <span>
                  {schedules.find((s) => s.type_of_day === index)?.start_time ??
                    "Not set"}{" "}
                  -
                  {schedules.find((s) => s.type_of_day === index)?.end_time ??
                    "Not set"}
                </span>
                <Button onClick={() => handleEdit(index)}>Edit</Button>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
