"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TimeEntry {
  id: number
  date: string
  start_time: string
  end_time: string
}

export default function TimeEntriesList() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    const fetchTimeEntries = async () => {
      const today = new Date()
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const response = await fetch(
        `/api/time-entries?startDate=${oneWeekAgo.toISOString().split("T")[0]}&endDate=${today.toISOString().split("T")[0]}`,
      )
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data)
      } else {
        console.error("Failed to fetch time entries")
      }
    }
    fetchTimeEntries()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {timeEntries.map((entry) => (
            <li key={entry.id} className="flex justify-between items-center">
              <span>{new Date(entry.date).toLocaleDateString()}</span>
              <span>
                {entry.start_time} - {entry.end_time}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

