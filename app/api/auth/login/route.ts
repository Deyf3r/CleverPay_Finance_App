import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Correo electrónico y contraseña son requeridos" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user || !user.password) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
    }

    // Create session
    const sessionToken = await createSession(user.id)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
