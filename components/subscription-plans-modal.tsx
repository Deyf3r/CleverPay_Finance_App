"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Crown, Star, Sparkles, ArrowLeft } from "lucide-react"
import { PaymentMethodModal } from "./payment-method-modal"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export interface PlanFeature {
  text: string
  included: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  features: PlanFeature[]
  featured?: boolean
  icon?: React.ReactNode
  color?: string
  description?: string
}

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfecto para comenzar con seguimiento financiero básico",
    icon: <Star className="h-5 w-5" />,
    color: "bg-gradient-to-r from-slate-600 to-slate-700",
    features: [
      { text: "Hasta 50 transacciones por mes", included: true },
      { text: "Seguimiento básico de presupuesto", included: true },
      { text: "Gestión de una sola cuenta", included: true },
      { text: "Resumen financiero mensual", included: true },
      { text: "Soporte por email", included: true },
      { text: "Análisis avanzados", included: false },
      { text: "Insights con IA", included: false },
      { text: "Gestión de múltiples cuentas", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    period: "month",
    description: "Funciones avanzadas para una gestión financiera seria",
    featured: true,
    icon: <Crown className="h-5 w-5" />,
    color: "bg-gradient-to-r from-emerald-600 to-sky-600",
    features: [
      { text: "Hasta 1000 transacciones", included: true },
      { text: "Seguimiento avanzado de presupuesto", included: true },
      { text: "Hasta 5 cuentas", included: true },
      { text: "Panel de análisis avanzado", included: true },
      { text: "Informes y gráficos personalizables", included: true },
      { text: "Seguimiento de datos en tiempo real", included: true },
      { text: "Soporte prioritario por email", included: true },
      { text: "Insights con IA", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    period: "month",
    description: "Gestión financiera definitiva con insights impulsados por IA",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-gradient-to-r from-sky-600 to-indigo-600",
    features: [
      { text: "Transacciones ilimitadas", included: true },
      { text: "Seguimiento avanzado de presupuesto", included: true },
      { text: "Cuentas ilimitadas", included: true },
      { text: "Panel de análisis avanzado", included: true },
      { text: "Informes y gráficos personalizables", included: true },
      { text: "Seguimiento de datos en tiempo real", included: true },
      { text: "Soporte prioritario 24/7", included: true },
      { text: "Insights y recomendaciones con IA", included: true },
    ],
  },
]

interface SubscriptionPlansModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  showInRegistration?: boolean
  onPlanSelect?: (plan: SubscriptionPlan) => void
}

export function SubscriptionPlansModal({
  isOpen,
  onClose,
  currentPlan,
  showInRegistration = false,
  onPlanSelect,
}: SubscriptionPlansModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { updateProfile } = useAuth()
  const { toast } = useToast()

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)

    if (showInRegistration) {
      if (onPlanSelect) {
        onPlanSelect(plan)
      }
      onClose()
      return
    }

    if (plan.price === 0) {
      // Free plan doesn't need payment
      updateProfile({ subscriptionPlan: plan.id })
      toast({
        title: "Plan actualizado",
        description: `Has cambiado exitosamente al plan ${plan.name}`,
      })
      onClose()
    } else {
      setShowPaymentModal(true)
    }
  }

  const handlePaymentSuccess = () => {
    if (selectedPlan) {
      updateProfile({ subscriptionPlan: selectedPlan.id })
      toast({
        title: "Plan actualizado",
        description: `Has cambiado exitosamente al plan ${selectedPlan.name}`,
      })
    }
    setShowPaymentModal(false)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[900px] p-0 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-2 relative sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={onClose}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Button>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-white text-center mt-4 bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Planes simples para finanzas inteligentes
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-center text-base sm:text-lg mt-2">
              Elige el plan que mejor se adapte a tus necesidades financieras.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-xl border border-slate-800 overflow-hidden transition-all hover:border-slate-700 hover:shadow-lg",
                  plan.featured && "border-emerald-500/50 shadow-lg shadow-emerald-500/10",
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1 whitespace-nowrap z-10">
                    <Crown className="h-3.5 w-3.5" />
                    Recomendado
                  </div>
                )}

                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap z-10">
                    Plan Actual
                  </div>
                )}

                <div className={cn("p-1", plan.color)}>
                  <div className="bg-slate-950 p-4 sm:p-5 rounded-t-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={cn(
                          "p-1.5 rounded-full",
                          plan.id === "free" ? "bg-slate-700" : plan.id === "pro" ? "bg-emerald-600" : "bg-sky-600",
                        )}
                      >
                        {plan.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{plan.description}</p>
                    <div className="flex items-baseline mb-5">
                      <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                        {plan.price === 0 ? "Gratis" : `€${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="ml-1 text-sm font-medium text-slate-400">/{plan.period}</span>
                      )}
                    </div>
                    <Button
                      className={cn(
                        "w-full",
                        plan.id === "free"
                          ? "bg-slate-700 hover:bg-slate-600"
                          : plan.id === "pro"
                            ? "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
                            : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700",
                      )}
                      onClick={() => handlePlanSelect(plan)}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id
                        ? "Plan Actual"
                        : plan.price === 0
                          ? "Comenzar Gratis"
                          : `Obtener ${plan.name}`}
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-4 sm:p-5 rounded-b-lg">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check
                            className={cn(
                              "h-5 w-5 mt-0.5 flex-shrink-0",
                              feature.included
                                ? plan.id === "free"
                                  ? "text-slate-400"
                                  : plan.id === "pro"
                                    ? "text-emerald-400"
                                    : "text-sky-400"
                                : "text-slate-700",
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm",
                              feature.included ? "text-slate-300" : "text-slate-600 line-through",
                            )}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedPlan && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

