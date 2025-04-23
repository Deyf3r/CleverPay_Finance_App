import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { getUserBySessionToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserBySessionToken(sessionToken)
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    console.log("[TRANSACTIONS_POST] Request body:", json)

    // Normalize category to remove accents and special characters
    const normalizedCategory = json.category?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    const result = await prisma.$transaction(async (tx) => {
      // Crear las etiquetas primero
      const tags = json.tags ? await Promise.all(
        json.tags.map((tagName: string) =>
          tx.tag.upsert({
            where: {
              name_userId: {
                name: tagName,
                userId: user.id,
              },
            },
            create: {
              name: tagName,
              userId: user.id,
            },
            update: {},
          })
        )
      ) : []

      // Crear la transacción con las referencias a las etiquetas
      const newTransaction = await tx.transaction.create({
        data: {
          title: json.title,
          amount: json.amount,
          type: json.type,
          date: new Date(json.date),
          category: normalizedCategory || json.category, // Use normalized category if available
          isRecurring: json.isRecurring || false,
          importance: json.importance || 3,
          description: json.description,
          recurringFrequency: json.recurringFrequency,
          account: json.account || "checking",
          userId: user.id,
          tags: {
            connect: tags.map(tag => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      })

      return newTransaction
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error)
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 })
    }
    return new NextResponse("Unknown error occurred", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await getUserBySessionToken(sessionToken)
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        tags: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error)
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 })
    }
    return new NextResponse("Unknown error occurred", { status: 500 })
  }
}
