"use client"

import { useState, useEffect } from "react"
import NavBar from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import {
  predictExpenses,
  predictIncome,
  identifyAnomalousSpending,
  suggestSavingsGoals,
  generateFinancialInsights,
} from "@/utils/ai-predictions"
import PredictionChart from "@/components/prediction-chart"
import SpendingAnomalies from "@/components/spending-anomalies"
import SavingsGoal from "@/components/savings-goal"
import AutoCategorize from "@/components/auto-categorize"
import {
  BrainCircuitIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  PiggyBankIcon,
  LightbulbIcon,
  BarChart2Icon,
  TagIcon,
} from "lucide-react"

export default function AIInsightsPage() {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [activeTab, setActiveTab] = useState("insights")
  const [isLoading, setIsLoading] = useState(true)

  // Estados para almacenar los resultados de los análisis
  const [expensePredictions, setExpensePredictions] = useState<any[]>([])
  const [incomePredictions, setIncomePredictions] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [savingsGoal, setSavingsGoal] = useState<any>({ amount: 0, description: "" })
  const [insights, setInsights] = useState<{
    insights: string[]
    spendingTrends: any[]
    topExpenseCategories: any[]
  }>({ insights: [], spendingTrends: [], topExpenseCategories: [] })

  // Calcular ahorros actuales del mes
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthIncome = state.transactions
    .filter((t) => {
      const date = new Date(t.date)
      return t.type === "income" && date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = state.transactions
    .filter((t) => {
      const date = new Date(t.date)
      return t.type === "expense" && date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const currentSavings = Math.max(0, currentMonthIncome - currentMonthExpenses)

  // Efecto para calcular todos los análisis de IA
  useEffect(() => {
    // Simular un pequeño retraso para dar la sensación de procesamiento
    const timer = setTimeout(() => {
      // Realizar todos los cálculos de IA
      const expensePreds = predictExpenses(state.transactions)
      const incomePreds = predictIncome(state.transactions)
      const anomaliesResult = identifyAnomalousSpending(state.transactions)
      const savingsGoalResult = suggestSavingsGoals(state.transactions)
      const insightsResult = generateFinancialInsights(state.transactions)

      // Actualizar los estados
      setExpensePredictions(expensePreds)
      setIncomePredictions(incomePreds)
      setAnomalies(anomaliesResult)
      setSavingsGoal(savingsGoalResult)
      setInsights(insightsResult)

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [state.transactions])

  // Renderizar un estado de carga
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <NavBar />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BrainCircuitIcon className="h-6 w-6 mr-2 text-primary animate-pulse" />
              <h2 className="text-3xl font-bold tracking-tight">{translate("ai.title")}</h2>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium">{translate("ai.analyzing_data")}</p>
            <p className="text-sm text-muted-foreground mt-2">{translate("ai.please_wait")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BrainCircuitIcon className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">{translate("ai.title")}</h2>
          </div>
        </div>

        <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights" className="flex items-center">
              <LightbulbIcon className="h-4 w-4 mr-2" />
              {translate("ai.insights")}
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              {translate("ai.predictions")}
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center">
              <AlertTriangleIcon className="h-4 w-4 mr-2" />
              {translate("ai.anomalies")}
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center">
              <PiggyBankIcon className="h-4 w-4 mr-2" />
              {translate("ai.savings")}
            </TabsTrigger>
            <TabsTrigger value="categorize" className="flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              {translate("ai.categorize")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <Card className="card">
              <CardHeader>
                <CardTitle>{translate("ai.financial_insights")}</CardTitle>
                <CardDescription>{translate("ai.personalized_analysis")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {insights.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 bg-muted/30 p-3 rounded-md">
                      <LightbulbIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{translate("ai.spending_trends")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {insights.spendingTrends.length > 0 ? (
                        insights.spendingTrends.map((trend, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              {trend.trend === "increasing" ? (
                                <TrendingUpIcon className="h-4 w-4 text-rose-500 dark:text-rose-400 mr-2" />
                              ) : trend.trend === "decreasing" ? (
                                <TrendingDownIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mr-2" />
                              ) : (
                                <BarChart2Icon className="h-4 w-4 text-muted-foreground mr-2" />
                              )}
                              <span className="text-sm">{translate(`category.${trend.category}`)}</span>
                            </div>
                            <span
                              className={`text-xs font-medium ${
                                trend.trend === "increasing"
                                  ? "text-rose-500 dark:text-rose-400"
                                  : trend.trend === "decreasing"
                                    ? "text-emerald-500 dark:text-emerald-400"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {trend.percentage.toFixed(1)}%
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">{translate("ai.no_trends")}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{translate("ai.top_expenses")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {insights.topExpenseCategories.length > 0 ? (
                        insights.topExpenseCategories.map((category, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{translate(`category.${category.category}`)}</span>
                              <span className="text-xs font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, category.percentage)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-muted-foreground text-right">
                              {category.percentage.toFixed(1)}%
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">{translate("ai.no_expenses")}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Card className="card">
              <CardHeader>
                <CardTitle>{translate("ai.future_predictions")}</CardTitle>
                <CardDescription>{translate("ai.based_on_history")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">{translate("ai.income_expense_forecast")}</h3>
                  <PredictionChart
                    incomeData={incomePredictions}
                    expenseData={expensePredictions}
                    title={translate("ai.next_months_forecast")}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{translate("ai.predicted_income")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-500">
                        {formatCurrency(incomePredictions[0]?.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{translate("ai.next_month")}</p>
                    </CardContent>
                  </Card>

                  <Card className="card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{translate("ai.predicted_expenses")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-rose-500">
                        {formatCurrency(expensePredictions[0]?.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{translate("ai.next_month")}</p>
                    </CardContent>
                  </Card>
                </div>

                {expensePredictions[0]?.categories && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">{translate("ai.predicted_categories")}</h3>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                      {Object.entries(expensePredictions[0].categories)
                        .slice(0, 6)
                        .map(([category, amount]) => (
                          <div key={category} className="bg-muted/30 p-3 rounded-md">
                            <p className="text-xs font-medium">{translate(`category.${category}`)}</p>
                            <p className="text-sm font-bold mt-1">{formatCurrency(amount as number)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies">
            <SpendingAnomalies anomalies={anomalies} />
          </TabsContent>

          <TabsContent value="savings">
            <SavingsGoal goal={savingsGoal} currentSavings={currentSavings} />
          </TabsContent>

          <TabsContent value="categorize">
            <AutoCategorize />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

