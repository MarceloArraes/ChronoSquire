// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../../auth/[...nextauth]/route"
// import db from "@/app/lib/db"

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//   }

//   const id = params.id

//   try {
//     await db.query("DELETE FROM holidays WHERE id = $1", [id])
//     return NextResponse.json({ message: "Holiday deleted successfully" })
//   } catch (error) {
//     console.error("Error deleting holiday:", error)
//     return NextResponse.json({ error: "Failed to delete holiday" }, { status: 500 })
//   }
// }
