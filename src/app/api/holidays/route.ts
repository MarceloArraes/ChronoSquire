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
//     const result = await db.query("SELECT * FROM holidays ORDER BY date")
//     return NextResponse.json(result.rows)
//   } catch (error) {
//     console.error("Error fetching holidays:", error)
//     return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const { date, name } = await request.json()

//   try {
//     const result = await db.query("INSERT INTO holidays (date, name) VALUES ($1, $2) RETURNING *", [date, name])
//     return NextResponse.json(result.rows[0])
//   } catch (error) {
//     console.error("Error inserting holiday:", error)
//     return NextResponse.json({ error: "Failed to insert holiday" }, { status: 500 })
//   }
// }
