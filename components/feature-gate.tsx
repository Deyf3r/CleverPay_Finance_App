"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { type FeatureKey, isFeatureAvailable, hasReachedLimit } from "@/utils/subscription-utils"
import { UpgradePlanMessage } from "./upgrade-plan-message"

interface FeatureGateProps {
  feature: FeatureKey
  children: ReactNode
  fallback?: ReactNode
  currentCount?: number
  compact?: boolean
}

export function FeatureGate({ feature, children, fallback, currentCount, compact = false }: FeatureGateProps) {
  const { user } = useAuth()
  const userPlan = user?.subscriptionPlan || "free"

  // Verificar si la característica está disponible para el plan del usuario
  const isAvailable = isFeatureAvailable(feature, userPlan)

  // Si hay un límite, verificar si el usuario lo ha alcanzado
  const limitReached = currentCount !== undefined && hasReachedLimit(feature, currentCount, userPlan)

  // Si la característica está disponible y no se ha alcanzado el límite, mostrar el contenido
  if (isAvailable && !limitReached) {
    return <>{children}</>
  }

  // Si se proporciona un fallback personalizado, mostrarlo
  if (fallback) {
    return <>{fallback}</>
  }

  // De lo contrario, mostrar el mensaje de actualización
  return <UpgradePlanMessage featureKey={feature} compact={compact} />
}

