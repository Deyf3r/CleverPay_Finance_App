import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserBySessionToken(sessionToken)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
