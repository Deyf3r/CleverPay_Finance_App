"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBankIcon, TrendingDownIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSettings } from "@/context/settings-context"

interface SavingsGoalProps {
  goal: {
    amount: number
    description: string
    potentialSavings: { category: string; amount: number; suggestion: string }[]
    savingsRate: number
  }
  currentSavings?: number
}

export default function SavingsGoal({ goal, currentSavings = 0 }: SavingsGoalProps) {
  const { formatCurrency, translate } = useSettings()

  const progress = goal.amount > 0 ? (currentSavings / goal.amount) * 100 : 0

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("ai.savings_goal")}</CardTitle>
        <CardDescription>{translate("ai.savings_recommendation")}</CardDescription>
      </CardHeader>
      <CardContent>
        {goal.amount > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-primary/10 dark:bg-primary/20 p-2">
                <PiggyBankIcon className="h-5 w-5 text-primary dark:text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{formatCurrency(goal.amount)}</p>
                <p className="text-sm text-muted-foreground">{translate("ai.per_month")}</p>
              </div>
              <div className="bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1">
                <p className="text-xs font-medium text-primary dark:text-primary-foreground">
                  {goal.savingsRate.toFixed(1)}% {translate("ai.of_income")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{translate("ai.current_savings")}</span>
                <span className="font-medium">{formatCurrency(currentSavings)}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>
                  {progress.toFixed(0)}% {translate("ai.of_goal")}
                </span>
                <span>100%</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{goal.description}</p>

            {goal.potentialSavings && goal.potentialSavings.length > 0 && (
              <div className="space-y-4 mt-4">
                <h4 className="text-sm font-medium">{translate("ai.potential_savings")}</h4>

                {goal.potentialSavings.map((saving, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-muted/30 p-3 rounded-md">
                    <TrendingDownIcon className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">{translate(`category.${saving.category}`)}</p>
                        <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400">
                          {formatCurrency(saving.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{saving.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <PiggyBankIcon className="h-6 w-6 text-primary" />
            </div>
            <p>{translate("ai.no_goal")}</p>
            <p className="text-sm mt-1">{goal.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

