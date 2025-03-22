// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../auth/[...nextauth]/route"
// import db from "@/app/lib/db"

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const { date, startTime, endTime } = await request.json()

//   try {
//     const result = await db.query(
//       "INSERT INTO time_entries (user_id, date, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *",
//       [session.user.id, date, startTime, endTime],
//     )
//     return NextResponse.json(result.rows[0])
//   } catch (error) {
//     console.error("Error inserting time entry:", error)
//     return NextResponse.json({ error: "Failed to insert time entry" }, { status: 500 })
//   }
// }

// export async function GET(request: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const { searchParams } = new URL(request.url)
//   const startDate = searchParams.get("startDate")
//   const endDate = searchParams.get("endDate")

//   try {
//     const result = await db.query(
//       "SELECT * FROM time_entries WHERE user_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date, start_time",
//       [session.user.id, startDate, endDate],
//     )
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error("Error fetching time entries:", error)
//     return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 })
//   }
// }
