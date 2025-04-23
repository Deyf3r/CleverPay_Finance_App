"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Lock, Calendar, ShieldCheck } from "lucide-react"
import type { SubscriptionPlan } from "./subscription-plans-modal"

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  plan: SubscriptionPlan
  onSuccess: () => void
}

export function PaymentMethodModal({ isOpen, onClose, plan, onSuccess }: PaymentMethodModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[500px] p-0 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
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
            Completa tu pago
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-white">{plan.name}</h3>
                <p className="text-sm text-slate-400">
                  Facturación {plan.period === "month" ? "mensual" : plan.period === "quarter" ? "trimestral" : "anual"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">€{plan.price}</p>
                <p className="text-xs text-slate-400">/{plan.period}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-sm font-medium flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Nombre en la tarjeta
              </Label>
              <Input
                id="cardName"
                placeholder="Nombre completo"
                required
                className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium flex items-center gap-2 text-emerald-400">
                <CreditCard className="h-4 w-4" />
                Número de tarjeta
              </Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                  className="bg-slate-800 border-slate-700 text-white pl-10 focus:border-emerald-500 focus:ring-emerald-500/20"
                  pattern="[0-9\s]{13,19}"
                  maxLength={19}
                />
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-sm font-medium flex items-center gap-2 text-emerald-400">
                  <Calendar className="h-4 w-4" />
                  Fecha de expiración
                </Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  required
                  className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc" className="text-sm font-medium flex items-center gap-2 text-emerald-400">
                  <Lock className="h-4 w-4" />
                  CVC
                </Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  required
                  className="bg-slate-800 border-slate-700 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
                  pattern="[0-9]{3,4}"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 h-12 text-base"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Pagar €{plan.price}
                  </span>
                )}
              </Button>
            </div>

            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1 mt-4">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Pago seguro con cifrado SSL</span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
