"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import DashboardPage from "./dashboard"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no está cargando y no está autenticado, redirigir a login
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Mientras carga, no mostrar nada
  if (isLoading) {
    return null
  }

  // Si está autenticado, mostrar el dashboard
  if (isAuthenticated) {
    return <DashboardPage />
  }

  // Si no está autenticado, no mostrar nada (se redirigirá a login)
  return null
}

