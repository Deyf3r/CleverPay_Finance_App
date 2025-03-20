"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  provider?: "email" | "google" | "facebook"
  financialGoals?: {
    type: string
    target: number
    current: number
    deadline?: string
  }[]
  budgets?: {
    category: string
    limit: number
  }[]
  notificationPreferences?: {
    budgetAlerts: boolean
    weeklyReports: boolean
    unusualActivity: boolean
    tips: boolean
  }
  securitySettings?: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
  }
}

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  loginWithProvider: (provider: "google" | "facebook") => Promise<{ success: boolean; message?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
  updateProfile: (data: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data
const mockUser: UserProfile = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "/placeholder.svg?height=200&width=200",
  provider: "email",
  financialGoals: [
    {
      type: "savings",
      target: 10000,
      current: 3500,
      deadline: "2023-12-31",
    },
    {
      type: "debt",
      target: 5000,
      current: 2000,
      deadline: "2023-10-31",
    },
  ],
  budgets: [
    { category: "food", limit: 500 },
    { category: "entertainment", limit: 200 },
    { category: "transportation", limit: 300 },
  ],
  notificationPreferences: {
    budgetAlerts: true,
    weeklyReports: true,
    unusualActivity: true,
    tips: false,
  },
  securitySettings: {
    twoFactorEnabled: false,
    lastPasswordChange: "2023-01-15",
  },
}

// Mock users database
const mockUsers = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "password123", // In a real app, this would be hashed
    avatar: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "user-2",
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123", // In a real app, this would be hashed
    avatar: "/placeholder.svg?height=200&width=200",
  },
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("finance_app_user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        // Auto-login for development purposes - comment this out for production
        // setUser(mockUser)
        // localStorage.setItem("finance_app_user", JSON.stringify(mockUser))
      }
      setIsLoading(false)
    }

    // Simulate network delay
    setTimeout(checkAuth, 500)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user in mock database
    const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (foundUser) {
      // Create user profile from found user
      const userProfile: UserProfile = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        avatar: foundUser.avatar,
        provider: "email",
        // Add default values for other properties
        notificationPreferences: {
          budgetAlerts: true,
          weeklyReports: true,
          unusualActivity: true,
          tips: false,
        },
        securitySettings: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date().toISOString(),
        },
      }

      setUser(userProfile)
      localStorage.setItem("finance_app_user", JSON.stringify(userProfile))
      setIsLoading(false)
      return { success: true }
    }

    setIsLoading(false)
    return { success: false, message: "Credenciales inválidas. Por favor, inténtalo de nuevo." }
  }

  const loginWithProvider = async (provider: "google" | "facebook") => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, this would authenticate with the provider
    // For demo purposes, we'll create a mock user
    const providerUser: UserProfile = {
      id: `${provider}-user-1`,
      name: provider === "google" ? "Google User" : "Facebook User",
      email: `${provider}user@example.com`,
      avatar: "/placeholder.svg?height=200&width=200",
      provider: provider,
      notificationPreferences: {
        budgetAlerts: true,
        weeklyReports: true,
        unusualActivity: true,
        tips: false,
      },
      securitySettings: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
      },
    }

    setUser(providerUser)
    localStorage.setItem("finance_app_user", JSON.stringify(providerUser))
    setIsLoading(false)
    return { success: true }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const userExists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userExists) {
      setIsLoading(false)
      return { success: false, message: "Este correo electrónico ya está registrado." }
    }

    // Create new user
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: "/placeholder.svg?height=200&width=200",
      provider: "email",
      notificationPreferences: {
        budgetAlerts: true,
        weeklyReports: true,
        unusualActivity: true,
        tips: false,
      },
      securitySettings: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
      },
    }

    // In a real app, we would save this to a database
    // For demo purposes, we'll just set the user
    setUser(newUser)
    localStorage.setItem("finance_app_user", JSON.stringify(newUser))
    setIsLoading(false)
    return { success: true }
  }

  const logout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("¿Estás seguro de que deseas cerrar sesión?")

    if (confirmed) {
      setUser(null)
      localStorage.removeItem("finance_app_user")
      router.push("/login")
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user exists
    const userExists = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!userExists) {
      setIsLoading(false)
      return { success: false, message: "No encontramos una cuenta con ese correo electrónico." }
    }

    // In a real app, we would send a password reset email
    setIsLoading(false)
    return {
      success: true,
      message: "Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
    }
  }

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("finance_app_user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithProvider,
        register,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

