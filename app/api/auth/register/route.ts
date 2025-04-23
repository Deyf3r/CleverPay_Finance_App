import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createUser } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, subscriptionPlan = "free" } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nombre, correo electrónico y contraseña son requeridos" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json({ message: "Este correo electrónico ya está registrado" }, { status: 409 })
    }

    // Create user
    await createUser(name, email, password, subscriptionPlan)

    return NextResponse.json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
