import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import db from "@/app/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await db.query(
      "SELECT * FROM hourly_rates WHERE user_id = $1 ORDER BY day_of_week, is_night_shift",
      [session.user.id],
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching hourly rates:", error)
    return NextResponse.json({ error: "Failed to fetch hourly rates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { day_of_week, is_night_shift, rate } = await request.json()

  try {
    const result = await db.query(
      "INSERT INTO hourly_rates (user_id, day_of_week, is_night_shift, rate) VALUES ($1, $2, $3, $4) RETURNING *",
      [session.user.id, day_of_week, is_night_shift, rate],
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error inserting hourly rate:", error)
    return NextResponse.json({ error: "Failed to insert hourly rate" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { day_of_week, is_night_shift, rate } = await request.json()

  try {
    const result = await db.query(
      "UPDATE hourly_rates SET rate = $1 WHERE user_id = $2 AND day_of_week = $3 AND is_night_shift = $4 RETURNING *",
      [rate, session.user.id, day_of_week, is_night_shift],
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating hourly rate:", error)
    return NextResponse.json({ error: "Failed to update hourly rate" }, { status: 500 })
  }
}

