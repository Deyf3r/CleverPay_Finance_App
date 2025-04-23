import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/auth-utils"
import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Correo electrónico es requerido" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ message: "No encontramos una cuenta con ese correo electrónico" }, { status: 404 })
    }

    // Create reset token
    const token = uuidv4()
    const expires = new Date()
    expires.setHours(expires.getHours() + 1) // Token expires in 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // In a real app, send email with reset link
    console.log(`Reset password link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)

    return NextResponse.json({
      message: "Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
