"use client"

import { Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PLAN_FEATURES, FEATURE_NAMES, type FeatureKey } from "@/utils/subscription-utils"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { SubscriptionPlansModal } from "./subscription-plans-modal"

export function PlanFeaturesComparison() {
  const { user } = useAuth()
  const [showPlansModal, setShowPlansModal] = useState(false)
  const currentPlan = user?.subscriptionPlan || "free"

  // Lista de características a mostrar en la comparación
  const featuresToShow: FeatureKey[] = [
    "transactions_limit",
    "accounts_limit",
    "advanced_analytics",
    "custom_reports",
    "real_time_tracking",
    "data_export",
    "ai_insights",
    "custom_categories",
    "budget_planning",
    "investment_tracking",
    "multi_currency",
    "priority_support",
  ]

  // Función para formatear el valor de una característica
  const formatFeatureValue = (plan: string, feature: FeatureKey) => {
    const value = PLAN_FEATURES[plan][feature]

    if (feature === "transactions_limit" || feature === "accounts_limit") {
      return value === Number.POSITIVE_INFINITY ? "Ilimitado" : value
    }

    return value ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800/60 shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 pb-4">
          <CardTitle className="text-xl">Comparación de Planes</CardTitle>
          <CardDescription>Compara las características disponibles en cada plan</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Característica</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">Free</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">Pro</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {featuresToShow.map((feature) => (
                  <tr key={feature} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{FEATURE_NAMES[feature]}</td>
                    <td className="px-4 py-3 text-center">
                      {typeof PLAN_FEATURES.free[feature] === "boolean" ? (
                        PLAN_FEATURES.free[feature] ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">
                          {PLAN_FEATURES.free[feature] === Number.POSITIVE_INFINITY
                            ? "Ilimitado"
                            : PLAN_FEATURES.free[feature]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof PLAN_FEATURES.pro[feature] === "boolean" ? (
                        PLAN_FEATURES.pro[feature] ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">
                          {PLAN_FEATURES.pro[feature] === Number.POSITIVE_INFINITY
                            ? "Ilimitado"
                            : PLAN_FEATURES.pro[feature]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof PLAN_FEATURES.premium[feature] === "boolean" ? (
                        PLAN_FEATURES.premium[feature] ? (
                          <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-rose-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">
                          {PLAN_FEATURES.premium[feature] === Number.POSITIVE_INFINITY
                            ? "Ilimitado"
                            : PLAN_FEATURES.premium[feature]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800/80 border-t border-slate-200 dark:border-slate-700/50">
            <Button
              onClick={() => setShowPlansModal(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {currentPlan === "free" ? "Actualizar mi plan" : "Cambiar mi plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SubscriptionPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        currentPlan={currentPlan}
      />
    </>
  )
}

