"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useSettings } from "@/context/settings-context"

interface DebtReductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DebtReductionDialog({ open, onOpenChange }: DebtReductionDialogProps) {
  const { translate, formatCurrency } = useSettings()
  const [step, setStep] = useState(1)

  const debts = [
    {
      id: 1,
      name: translate("debt.credit_card"),
      amount: 3500,
      interestRate: 18,
      minimumPayment: 105,
      priority: "high",
    },
    {
      id: 2,
      name: translate("debt.personal_loan"),
      amount: 5000,
      interestRate: 8,
      minimumPayment: 150,
      priority: "medium",
    },
  ]

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0)
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const extraPayment = 200

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onOpenChange(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20">
              <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">{translate("debt.reduction_strategy")}</DialogTitle>
              <DialogDescription>{translate("debt.personalized_plan")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border border-rose-100 dark:border-rose-900/20">
                <h3 className="font-medium text-lg mb-2">{translate("debt.strategy_recommendation")}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{translate("debt.snowball_method")}</p>
                <Badge className="bg-rose-500 hover:bg-rose-600">{translate("debt.recommended_for_you")}</Badge>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">{translate("debt.your_debts")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {debts.map((debt) => (
                    <div
                      key={debt.id}
                      className={`p-4 rounded-lg border ${
                        debt.priority === "high"
                          ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30"
                          : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{debt.name}</h4>
                          <p className="text-2xl font-bold mt-1">{formatCurrency(debt.amount)}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            debt.priority === "high"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800/30"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30"
                          }
                        >
                          {debt.priority === "high"
                            ? translate("debt.high_priority")
                            : translate("debt.medium_priority")}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>
                          {debt.interestRate}% {translate("debt.interest_rate")}
                        </span>
                        <span>Min: {formatCurrency(debt.minimumPayment)}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translate("dashboard.total_balance")}</p>
                  <p className="text-xl font-bold">{formatCurrency(totalDebt)}</p>
                </div>
                <Button onClick={handleNext} className="bg-rose-600 hover:bg-rose-700">
                  {translate("debt.create_strategy")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-medium text-lg">{translate("debt.steps_to_reduce")}</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
                  <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-8 h-8 flex items-center justify-center font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">{translate("debt.prioritize")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {translate("debt.focus_highest_interest")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
                  <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-8 h-8 flex items-center justify-center font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">{translate("debt.minimum_payments")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{translate("debt.make_minimum")}</p>
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                      <p className="text-sm font-medium">
                        {translate("dashboard.total_expenses")}: {formatCurrency(totalMinimumPayment)}/mo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
                  <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-8 h-8 flex items-center justify-center font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">{translate("debt.extra_payments")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{translate("debt.allocate_extra")}</p>
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                      <p className="text-sm font-medium">
                        {translate("ai.recommended_amount")}: {formatCurrency(extraPayment)}/mo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/30">
                  <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-8 h-8 flex items-center justify-center font-bold mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-medium">{translate("debt.move_to_next")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {translate("debt.after_paying_first")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  {translate("dashboard.back")}
                </Button>
                <Button onClick={handleNext} className="bg-rose-600 hover:bg-rose-700">
                  {translate("common.close")}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{translate("alert.success")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{translate("debt.personalized_plan")}</p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      {translate("tips.debt_explanation")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  {translate("dashboard.back")}
                </Button>
                <Button onClick={() => onOpenChange(false)} className="bg-rose-600 hover:bg-rose-700">
                  {translate("common.close")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
