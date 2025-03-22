// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../auth/[...nextauth]/route"
// import db from "@/app/lib/db"

// export async function GET(request: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   try {
//     const result = await db.query("SELECT * FROM work_schedules WHERE user_id = $1 ORDER BY day_of_week", [
//       session.user.id,
//     ])
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error("Error fetching work schedules:", error)
//     return NextResponse.json({ error: "Failed to fetch work schedules" }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const { day_of_week, start_time, end_time } = await request.json()

//   try {
//     const result = await db.query(
//       "INSERT INTO work_schedules (user_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *",
//       [session.user.id, day_of_week, start_time, end_time],
//     )
//     return NextResponse.json(result.rows[0])
//   } catch (error) {
//     console.error("Error inserting work schedule:", error)
//     return NextResponse.json({ error: "Failed to insert work schedule" }, { status: 500 })
//   }
// }

// export async function PUT(request: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const { day_of_week, start_time, end_time } = await request.json()

//   try {
//     const result = await db.query(
//       "UPDATE work_schedules SET start_time = $1, end_time = $2 WHERE user_id = $3 AND day_of_week = $4 RETURNING *",
//       [start_time, end_time, session.user.id, day_of_week],
//     )
//     return NextResponse.json(result.rows[0])
//   } catch (error) {
//     console.error("Error updating work schedule:", error)
//     return NextResponse.json({ error: "Failed to update work schedule" }, { status: 500 })
//   }
// }
