"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TimeEntry {
  id: number
  date: string
  start_time: string
  end_time: string
}

interface HourlyRate {
  id: number
  day_of_week: number
  is_night_shift: boolean
  rate: number
}

export default function WeeklyReport() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [hourlyRates, setHourlyRates] = useState<HourlyRate[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    setStartDate(oneWeekAgo.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchTimeEntries()
      fetchHourlyRates()
    }
  }, [startDate, endDate])

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`/api/time-entries?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data)
      } else {
        throw new Error("Failed to fetch time entries")
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
    }
  }

  const fetchHourlyRates = async () => {
    try {
      const response = await fetch("/api/hourly-rates")
      if (response.ok) {
        const data = await response.json()
        setHourlyRates(data)
      } else {
        throw new Error("Failed to fetch hourly rates")
      }
    } catch (error) {
      console.error("Error fetching hourly rates:", error)
    }
  }

  const calculateTotalHours = () => {
    return timeEntries.reduce((total, entry) => {
      const start = new Date(`${entry.date}T${entry.start_time}`)
      const end = new Date(`${entry.date}T${entry.end_time}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0)
  }

  const calculateTotalEarnings = () => {
    return timeEntries.reduce((total, entry) => {
      const start = new Date(`${entry.date}T${entry.start_time}`)
      const end = new Date(`${entry.date}T${entry.end_time}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      const dayOfWeek = new Date(entry.date).getDay()
      const isNightShift = start.getHours() >= 18 || end.getHours() < 6
      const rate = hourlyRates.find((r) => r.day_of_week === dayOfWeek && r.is_night_shift === isNightShift)?.rate || 0
      return total + hours * rate
    }, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="space-y-4">
          <p>
            <strong>Total Hours Worked:</strong> {calculateTotalHours().toFixed(2)} hours
          </p>
          <p>
            <strong>Total Earnings:</strong> ${calculateTotalEarnings().toFixed(2)}
          </p>
        </div>
        <Button onClick={fetchTimeEntries} className="mt-4">
          Refresh Report
        </Button>
      </CardContent>
    </Card>
  )
}

