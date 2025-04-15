import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }

    // Clear cookie
    cookieStore.delete("session_token")

    return NextResponse.json({ message: "Sesión cerrada exitosamente" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
