"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Lock, Star, Sparkles, ArrowRight } from "lucide-react"
import { type FeatureKey, FEATURE_NAMES, getPlanName, getRequiredPlanForFeature } from "@/utils/subscription-utils"
import { SubscriptionPlansModal } from "./subscription-plans-modal"

interface UpgradePlanMessageProps {
  featureKey: FeatureKey
  className?: string
  compact?: boolean
  onUpgrade?: () => void
}

export function UpgradePlanMessage({
  featureKey,
  className = "",
  compact = false,
  onUpgrade,
}: UpgradePlanMessageProps) {
  const [showPlansModal, setShowPlansModal] = useState(false)
  const requiredPlan = getRequiredPlanForFeature(featureKey)
  const featureName = FEATURE_NAMES[featureKey]
  const planName = getPlanName(requiredPlan)

  const getPlanIcon = () => {
    switch (requiredPlan) {
      case "pro":
        return <Crown className="h-5 w-5 text-blue-500" />
      case "premium":
        return <Sparkles className="h-5 w-5 text-purple-500" />
      default:
        return <Star className="h-5 w-5 text-slate-500" />
    }
  }

  const handleUpgradeClick = () => {
    setShowPlansModal(true)
    if (onUpgrade) onUpgrade()
  }

  if (compact) {
    return (
      <>
        <div
          className={`flex items-center gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 ${className}`}
        >
          <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <p className="text-sm flex-1 text-slate-700 dark:text-slate-300">
            <span className="font-medium">{featureName}</span> está disponible en el plan {planName}
          </p>
          <Button
            size="sm"
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Actualizar
          </Button>
        </div>
        <SubscriptionPlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
      </>
    )
  }

  return (
    <>
      <Card className={`overflow-hidden border-slate-200 dark:border-slate-800/60 ${className}`}>
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            Característica no disponible
          </CardTitle>
          <CardDescription>Esta función requiere un plan superior</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
            {getPlanIcon()}
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {featureName} está disponible en el plan {planName}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Actualiza tu plan para desbloquear esta y otras características
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Actualizar a {planName} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      <SubscriptionPlansModal isOpen={showPlansModal} onClose={() => setShowPlansModal(false)} />
    </>
  )
}

