"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@prisma/client"

export interface UserProfile extends Omit<User, "password"> {
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
  register: (
    name: string,
    email: string,
    password: string,
    subscriptionPlan?: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
  updateProfile: (data: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser({
              ...data.user,
              avatar: data.user.image || "/placeholder.svg?height=200&width=200",
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
            })
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser({
          ...data.user,
          avatar: data.user.image || "/placeholder.svg?height=200&width=200",
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
        })
        return { success: true }
      } else {
        return { success: false, message: data.message || "Credenciales inválidas. Por favor, inténtalo de nuevo." }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo." }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithProvider = async (provider: "google" | "facebook") => {
    setIsLoading(true)

    try {
      // Redirect to provider auth page
      window.location.href = `/api/auth/${provider}`
      return { success: true }
    } catch (error) {
      console.error(`${provider} login error:`, error)
      return { success: false, message: `Error al iniciar sesión con ${provider}. Por favor, inténtalo de nuevo.` }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, subscriptionPlan = "free") => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, subscriptionPlan }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, message: data.message || "Error al registrar. Por favor, inténtalo de nuevo." }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo." }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("¿Estás seguro de que deseas cerrar sesión?")

    if (confirmed) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        })
        setUser(null)
        router.push("/login")
      } catch (error) {
        console.error("Logout error:", error)
      }
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: "Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
        }
      } else {
        return {
          success: false,
          message: data.message || "Error al restablecer la contraseña. Por favor, inténtalo de nuevo.",
        }
      }
    } catch (error) {
      console.error("Reset password error:", error)
      return { success: false, message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo." }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (user) {
      try {
        const response = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          const updatedUser = { ...user, ...data }
          setUser(updatedUser)
        }
      } catch (error) {
        console.error("Update profile error:", error)
      }
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
