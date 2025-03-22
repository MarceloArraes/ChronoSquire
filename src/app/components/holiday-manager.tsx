"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Holiday {
  id: number;
  date: string;
  name: string;
}

export default function HolidayManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");

  useEffect(() => {
    fetchHolidays().catch((err) => {
      console.log("err", err);
    });
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await fetch("/api/holidays");
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      } else {
        throw new Error("Failed to fetch holidays");
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newHolidayDate, name: newHolidayName }),
      });

      if (response.ok) {
        await fetchHolidays();
        setNewHolidayDate("");
        setNewHolidayName("");
      } else {
        throw new Error("Failed to add holiday");
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    try {
      const response = await fetch(`/api/holidays/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchHolidays();
      } else {
        throw new Error("Failed to delete holiday");
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holiday Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddHoliday} className="mb-4">
          <div className="flex items-end gap-2">
            <div>
              <Label htmlFor="holidayDate">Date</Label>
              <Input
                id="holidayDate"
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="holidayName">Name</Label>
              <Input
                id="holidayName"
                type="text"
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Add Holiday</Button>
          </div>
        </form>
        <ul className="space-y-2">
          {holidays.map((holiday) => (
            <li key={holiday.id} className="flex items-center justify-between">
              <span>
                {new Date(holiday.date).toLocaleDateString()} - {holiday.name}
              </span>
              <Button
                variant="destructive"
                onClick={() => handleDeleteHoliday(holiday.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
