import { compare, hash } from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import prisma from "./prisma"
import type { User } from "@prisma/client"

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  const sessionToken = uuidv4()

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: expiresAt,
    },
  })

  return sessionToken
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserBySessionToken(token: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  })

  if (!session || session.expires < new Date()) {
    return null
  }

  return session.user
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  subscriptionPlan = "free",
): Promise<User> {
  const hashedPassword = await hashPassword(password)

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      subscriptionPlan,
    },
  })
}

export async function createProviderUser(
  name: string,
  email: string,
  provider: string,
  providerAccountId: string,
  subscriptionPlan = "free",
): Promise<User> {
  // Check if user exists
  let user = await getUserByEmail(email)

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        name,
        email,
        subscriptionPlan,
      },
    })
  }

  // Check if account exists
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
  })

  if (!existingAccount) {
    // Create account
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider,
        providerAccountId,
      },
    })
  }

  return user
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { sessionToken: token },
  })
}
