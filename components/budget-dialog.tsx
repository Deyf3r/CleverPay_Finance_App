"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, PieChart, Plus } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BudgetDialog({ open, onOpenChange }: BudgetDialogProps) {
  const { formatCurrency, translate } = useSettings()
  const [step, setStep] = useState<"overview" | "detailed">("overview")

  // Sample budget data
  const categories = [
    { name: translate("category.housing"), percentage: 80.3, amount: 1200, suggested: 1080 },
    { name: translate("category.food"), percentage: 10.3, amount: 154.32, suggested: 138.89 },
    { name: translate("category.utilities"), percentage: 7.0, amount: 104.99, suggested: 94.49 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step === "detailed" && (
              <Button variant="ghost" size="icon" onClick={() => setStep("overview")} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {step === "overview" ? translate("budget.create_budget") : translate("budget.detailed_budget")}
                </span>
              </DialogTitle>
              <DialogDescription>
                {step === "overview"
                  ? translate("budget.distribute_expenses")
                  : translate("budget.customize_categories")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "overview" ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{translate("budget.main_categories")}</h3>

              {categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          index === 0
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : index === 1
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {category.name}
                      </span>
                      <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                    </div>
                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                  </div>

                  <div className="space-y-1">
                    <Progress
                      value={100}
                      className="h-2"
                      indicatorClassName={index === 0 ? "bg-purple-500" : index === 1 ? "bg-blue-500" : "bg-green-500"}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {translate("budget.suggested")}: {formatCurrency(category.suggested)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
                {translate("common.cancel")}
              </Button>
              <Button onClick={() => setStep("detailed")} className="sm:flex-1 gap-2">
                {translate("budget.create_detailed")}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">{translate("budget.monthly_income")}</Label>
                  <Input id="income" defaultValue="1500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings">{translate("budget.savings_goal_percent")}</Label>
                  <Input id="savings" defaultValue="20" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{translate("budget.categories")}</Label>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    <Plus className="h-3 w-3" />
                    {translate("budget.add_category")}
                  </Button>
                </div>

                {categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-center">
                    <div className="col-span-2">
                      <Input defaultValue={category.name} />
                    </div>
                    <div className="col-span-1">
                      <Input defaultValue={category.percentage.toString()} />
                    </div>
                    <div className="col-span-2">
                      <Input defaultValue={category.amount.toString()} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStep("overview")} className="sm:flex-1">
                {translate("common.back")}
              </Button>
              <Button onClick={() => onOpenChange(false)} className="sm:flex-1">
                {translate("budget.save_budget")}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
