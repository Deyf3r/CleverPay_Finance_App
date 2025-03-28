"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Crown } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { SubscriptionPlansModal } from "./subscription-plans-modal"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  featured?: boolean
  currentPlan?: string
}

export function PricingCard({ id, name, price, period, features, featured, currentPlan }: PricingCardProps) {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const isCurrentPlan = currentPlan?.toLowerCase() === id.toLowerCase()

  const handleGetPlan = () => {
    if (!isAuthenticated) {
      router.push("/register?plan=" + id)
      return
    }

    setShowSubscriptionModal(true)
  }

  return (
    <>
      <div
        className={cn(
          "relative p-4 sm:p-6 rounded-xl border transition-all h-full flex flex-col",
          featured
            ? "bg-gradient-to-b from-slate-800 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
            : "bg-slate-900 border-slate-800 hover:border-slate-700",
        )}
      >
        {featured && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1 whitespace-nowrap z-10">
            <Crown className="h-3.5 w-3.5" />
            Recomendado
          </div>
        )}

        {isCurrentPlan && (
          <div className="absolute -top-3 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap z-10">
            Plan Actual
          </div>
        )}

        <div className="space-y-6 flex-1 flex flex-col">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {id === "premium" && (
                <Badge variant="outline" className="bg-sky-500/20 text-sky-400 border-sky-500/30">
                  Premium
                </Badge>
              )}
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {price === 0 ? "Gratis" : `€${price}`}
              </span>
              {price > 0 && <span className="ml-1 text-sm font-medium text-slate-400">/{period}</span>}
            </div>
          </div>

          <ul className="space-y-3 flex-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check
                  className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    featured ? "text-emerald-400" : id === "premium" ? "text-sky-400" : "text-slate-400",
                  )}
                />
                <span className="text-sm text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className={cn(
              "w-full mt-auto",
              featured
                ? "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
                : price === 0
                  ? "bg-slate-700 hover:bg-slate-600"
                  : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700",
            )}
            onClick={handleGetPlan}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? "Plan Actual" : price === 0 ? "Comenzar Gratis" : `Obtener ${name}`}
          </Button>
        </div>
      </div>

      <SubscriptionPlansModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        currentPlan={currentPlan}
      />
    </>
  )
}

