import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../lib/auth-utils"

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await hashPassword("demo123")

  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      image: "/placeholder.svg?height=200&width=200",
      subscriptionPlan: "premium",
    },
  })

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
