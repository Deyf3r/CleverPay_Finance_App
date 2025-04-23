import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = cookies().get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const user = await getUserBySessionToken(sessionToken)

    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Prevent updating sensitive fields
    const { id, email, password, emailVerified, ...updateData } = data

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
