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
import AutoCategorize from "@/components/auto-categorize"
import {
  BrainCircuitIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  PiggyBankIcon,
  LightbulbIcon,
  TagIcon,
  ArrowLeftIcon,
  SparklesIcon,
  LineChartIcon,
  PieChartIcon,
  TargetIcon,
  WalletIcon,
  BarChartIcon,
  CheckIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FinancialAdviceHub } from "@/components/financial-advice-hub"

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

  // Traducir insights
  const translateInsight = (insightKey: string) => {
    if (!insightKey.includes("|")) return insightKey

    const [key, ...params] = insightKey.split("|")

    switch (key) {
      case "insight.top_category":
        return translate("category.main_expense")
          .replace("{category}", translate(`category.${params[0]}`))
          .replace("{percentage}", params[1])
      case "insight.increasing_trend":
        return translate("category.expense_increase")
          .replace("{category}", translate(`category.${params[0]}`))
          .replace("{percentage}", params[1])
      case "insight.decreasing_trend":
        return translate("category.expense_decrease")
          .replace("{category}", translate(`category.${params[0]}`))
          .replace("{percentage}", params[1])
      case "insight.excellent_savings":
        return translate("savings.excellent").replace("{percentage}", params[0])
      case "insight.good_savings":
        return translate("savings.good").replace("{percentage}", params[0])
      case "insight.negative_savings":
        return translate("savings.negative")
      default:
        return insightKey
    }
  }

  // Renderizar un estado de carga
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <NavBar />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 mr-2 text-primary animate-pulse" />
              <h2 className="text-3xl font-bold tracking-tight">{translate("ai.title")}</h2>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse opacity-75"></div>
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <BrainCircuitIcon className="h-8 w-8 text-primary animate-bounce" />
              </div>
            </div>
            <p className="text-lg font-medium">{translate("ai.analyzing_data")}</p>
            <p className="text-sm text-muted-foreground mt-2">{translate("ai.please_wait")}</p>
            <div className="w-64 h-2 bg-muted rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x"
                style={{ width: "70%" }}
              ></div>
            </div>
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
            <div className="mr-3 p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
              <SparklesIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 text-transparent bg-clip-text">
              {translate("ai.title")}
            </h2>
          </div>
          <Button variant="outline" asChild className="gap-2 hover:bg-muted/50 transition-all">
            <Link href="/">
              <ArrowLeftIcon className="h-4 w-4" />
              {translate("dashboard.back")}
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 dark:bg-muted/20 rounded-xl">
            <TabsTrigger
              value="insights"
              className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
            >
              <LightbulbIcon className="h-4 w-4" />
              {translate("ai.insights")}
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
            >
              <TrendingUpIcon className="h-4 w-4" />
              {translate("ai.predictions")}
            </TabsTrigger>
            <TabsTrigger
              value="anomalies"
              className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
            >
              <AlertTriangleIcon className="h-4 w-4" />
              {translate("ai.anomalies")}
            </TabsTrigger>
            <TabsTrigger
              value="savings"
              className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
            >
              <PiggyBankIcon className="h-4 w-4" />
              {translate("ai.savings")}
            </TabsTrigger>
            <TabsTrigger
              value="categorize"
              className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
            >
              <TagIcon className="h-4 w-4" />
              {translate("ai.categorize")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/5 dark:to-indigo-900/5 overflow-hidden">
              <CardHeader className="border-b border-purple-100/50 dark:border-purple-900/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                    <LightbulbIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{translate("ai.financial_insights")}</CardTitle>
                    <CardDescription>{translate("ai.personalized_analysis")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  {insights.insights.map((insight, index) => {
                    // Determinar el color de fondo basado en el tipo de insight
                    let bgGradient = "from-purple-500/10 to-indigo-500/10"
                    let iconBg = "bg-purple-100 dark:bg-purple-900/30"
                    let iconColor = "text-purple-600 dark:text-purple-400"

                    if (insight.includes("insight.increasing_trend")) {
                      bgGradient = "from-rose-500/10 to-pink-500/10"
                      iconBg = "bg-rose-100 dark:bg-rose-900/30"
                      iconColor = "text-rose-600 dark:text-rose-400"
                    } else if (insight.includes("insight.decreasing_trend")) {
                      bgGradient = "from-emerald-500/10 to-green-500/10"
                      iconBg = "bg-emerald-100 dark:bg-emerald-900/30"
                      iconColor = "text-emerald-600 dark:text-emerald-400"
                    } else if (
                      insight.includes("insight.excellent_savings") ||
                      insight.includes("insight.good_savings")
                    ) {
                      bgGradient = "from-blue-500/10 to-cyan-500/10"
                      iconBg = "bg-blue-100 dark:bg-blue-900/30"
                      iconColor = "text-blue-600 dark:text-blue-400"
                    } else if (insight.includes("insight.negative_savings")) {
                      bgGradient = "from-amber-500/10 to-yellow-500/10"
                      iconBg = "bg-amber-100 dark:bg-amber-900/30"
                      iconColor = "text-amber-600 dark:text-amber-400"
                    }

                    return (
                      <div
                        key={index}
                        className={`p-5 rounded-xl bg-gradient-to-r ${bgGradient} shadow-sm hover:shadow-md transition-all border border-opacity-30 transform hover:-translate-y-1`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-full ${iconBg} p-3 shadow-sm`}>
                            {insight.includes("insight.top_category") && (
                              <PieChartIcon className={`h-5 w-5 ${iconColor}`} />
                            )}
                            {insight.includes("insight.increasing_trend") && (
                              <TrendingUpIcon className={`h-5 w-5 ${iconColor}`} />
                            )}
                            {insight.includes("insight.decreasing_trend") && (
                              <TrendingDownIcon className={`h-5 w-5 ${iconColor}`} />
                            )}
                            {insight.includes("insight.excellent_savings") && (
                              <PiggyBankIcon className={`h-5 w-5 ${iconColor}`} />
                            )}
                            {insight.includes("insight.good_savings") && (
                              <WalletIcon className={`h-5 w-5 ${iconColor}`} />
                            )}
                            {insight.includes("insight.negative_savings") && (
                              <AlertTriangleIcon className={`h-5 w-5 ${iconColor}`} />
                            )}
                            {!insight.includes("|") && <BrainCircuitIcon className={`h-5 w-5 ${iconColor}`} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                              {translateInsight(insight)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Consejos Financieros Interactivos */}
                <FinancialAdviceHub />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Spending Trends */}
                  {insights.spendingTrends.length > 0 && (
                    <Card className="shadow-md border-0 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/10 dark:to-indigo-900/10 pb-3 border-b border-purple-100/50 dark:border-purple-900/10">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <LineChartIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          {translate("ai.spending_trends")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-5">
                          {insights.spendingTrends.map((trend, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{translate(`category.${trend.category}`)}</span>
                                <Badge
                                  variant="outline"
                                  className={`
                                    ${trend.trend === "increasing" ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30" : ""}
                                    ${trend.trend === "decreasing" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30" : ""}
                                    ${trend.trend === "stable" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30" : ""}
                                  `}
                                >
                                  {trend.trend === "increasing" && "+"}
                                  {trend.trend === "decreasing" && "-"}
                                  {trend.percentage.toFixed(1)}%
                                </Badge>
                              </div>
                              <Progress
                                value={100}
                                className={`h-2 ${
                                  trend.trend === "increasing"
                                    ? "bg-rose-100 dark:bg-rose-900/20"
                                    : trend.trend === "decreasing"
                                      ? "bg-emerald-100 dark:bg-emerald-900/20"
                                      : "bg-blue-100 dark:bg-blue-900/20"
                                }`}
                                indicatorClassName={`${
                                  trend.trend === "increasing"
                                    ? "bg-rose-500 dark:bg-rose-400"
                                    : trend.trend === "decreasing"
                                      ? "bg-emerald-500 dark:bg-emerald-400"
                                      : "bg-blue-500 dark:bg-blue-400"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Expense Categories */}
                  {insights.topExpenseCategories.length > 0 && (
                    <Card className="shadow-md border-0 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/10 dark:to-indigo-900/10 pb-3 border-b border-purple-100/50 dark:border-purple-900/10">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <PieChartIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          {translate("ai.top_expenses")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-5">
                          {insights.topExpenseCategories.slice(0, 4).map((category, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  {translate(`category.${category.category}`)}
                                </span>
                                <div className="text-right">
                                  <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    ({category.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={category.percentage}
                                className="h-2 bg-purple-100 dark:bg-purple-900/20"
                                indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/5 dark:to-indigo-900/5 overflow-hidden">
              <CardHeader className="border-b border-blue-100/50 dark:border-blue-900/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                    <TrendingUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>{translate("ai.future_predictions")}</CardTitle>
                    <CardDescription>{translate("ai.based_on_history")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {translate("ai.income_expense_forecast")}
                  </h3>
                  <div className="bg-white dark:bg-gray-800/60 p-4 rounded-xl shadow-md border border-blue-100/50 dark:border-blue-900/10">
                    <PredictionChart
                      incomeData={incomePredictions}
                      expenseData={expensePredictions}
                      title={translate("ai.next_months_forecast")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="shadow-md border border-blue-100/50 dark:border-blue-900/10 bg-gradient-to-br from-emerald-50/30 to-blue-50/30 dark:from-emerald-900/5 dark:to-blue-900/5">
                    <CardHeader className="pb-2 border-b border-blue-100/50 dark:border-blue-900/10">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChartIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {translate("ai.predicted_income")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                        {formatCurrency(incomePredictions[0]?.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{translate("ai.next_month")}</p>
                      <div className="mt-2 flex items-center text-xs">
                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-1 mr-2">
                          <LightbulbIcon className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <span className="text-muted-foreground">
                          {translate("ai.prediction_confidence")}:
                          <span className="text-emerald-500 dark:text-emerald-400 ml-1">
                            {translate("ai.high_confidence")}
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-md border border-blue-100/50 dark:border-blue-900/10 bg-gradient-to-br from-rose-50/30 to-orange-50/30 dark:from-rose-900/5 dark:to-orange-900/5">
                    <CardHeader className="pb-2 border-b border-blue-100/50 dark:border-blue-900/10">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChartIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        {translate("ai.predicted_expenses")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-rose-500 dark:text-rose-400">
                        {formatCurrency(expensePredictions[0]?.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">{translate("ai.next_month")}</p>
                      <div className="mt-2 flex items-center text-xs">
                        <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-1 mr-2">
                          <LightbulbIcon className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="text-muted-foreground">
                          {translate("ai.prediction_confidence")}:
                          <span className="text-amber-500 dark:text-amber-400 ml-1">
                            {translate("ai.medium_confidence")}
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {expensePredictions[0]?.categories && (
                  <div className="bg-white dark:bg-gray-800/60 p-5 rounded-xl shadow-md border border-blue-100/50 dark:border-blue-900/10">
                    <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      {translate("ai.predicted_categories")}
                    </h3>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                      {Object.entries(expensePredictions[0].categories)
                        .slice(0, 6)
                        .map(([category, amount], index) => {
                          // Generar colores diferentes para cada categoría
                          const colors = [
                            "from-purple-500/10 to-indigo-500/10 border-purple-200/50",
                            "from-blue-500/10 to-cyan-500/10 border-blue-200/50",
                            "from-emerald-500/10 to-green-500/10 border-emerald-200/50",
                            "from-amber-500/10 to-yellow-500/10 border-amber-200/50",
                            "from-rose-500/10 to-pink-500/10 border-rose-200/50",
                            "from-indigo-500/10 to-violet-500/10 border-indigo-200/50",
                          ]
                          const colorClass = colors[index % colors.length]

                          return (
                            <div
                              key={category}
                              className={`bg-gradient-to-r ${colorClass} p-4 rounded-lg shadow-sm border`}
                            >
                              <p className="text-xs font-medium">{translate(`category.${category}`)}</p>
                              <p className="text-sm font-bold mt-1">{formatCurrency(amount as number)}</p>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5 overflow-hidden">
              <CardHeader className="border-b border-amber-100/50 dark:border-amber-900/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                    <AlertTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle>{translate("ai.spending_anomalies")}</CardTitle>
                    <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {anomalies.length > 0 ? (
                  <div className="space-y-4">
                    {anomalies.map((anomaly, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-gray-800/60 p-5 rounded-xl shadow-md border border-amber-100/50 dark:border-amber-900/10 hover:shadow-lg transition-all transform hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                            <AlertTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {translate(`category.${anomaly.category}`)}
                            </h3>
                            <div className="flex items-center mt-1">
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                              >
                                +{anomaly.percentageIncrease.toFixed(1)}% {translate("ai.increase_from_last")}
                              </Badge>
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{translate("ai.average_spending")}</span>
                                  <span className="font-medium">{formatCurrency(anomaly.averageAmount)}</span>
                                </div>
                                <Progress value={60} className="h-2 bg-slate-200 dark:bg-slate-700" />
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{translate("ai.current_spending")}</span>
                                  <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {formatCurrency(anomaly.amount)}
                                  </span>
                                </div>
                                <Progress
                                  value={100}
                                  className="h-2 bg-amber-100 dark:bg-amber-900/20"
                                  indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500"
                                />
                              </div>

                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{anomaly.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
                      <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      {translate("ai.no_anomalies")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md">
                      {translate("ai.consistent_patterns")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/5 dark:to-teal-900/5 overflow-hidden">
              <CardHeader className="border-b border-emerald-100/50 dark:border-emerald-900/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                    <PiggyBankIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle>{translate("ai.savings_goal")}</CardTitle>
                    <CardDescription>{translate("ai.savings_recommendation")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="bg-white dark:bg-gray-800/60 p-5 rounded-xl shadow-md border border-emerald-100/50 dark:border-emerald-900/10">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                      <TargetIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{translate("ai.savings_goal")}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{savingsGoal.description}</p>

                      <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{translate("ai.recommended_amount")}</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(savingsGoal.amount)}
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                              {translate("ai.per_month")}
                            </span>
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>{translate("ai.current_savings")}</span>
                            <span className="font-medium">
                              {formatCurrency(savingsGoal.currentSavings || 0)}
                              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                ({Math.round(((savingsGoal.currentSavings || 0) / savingsGoal.amount) * 100)}%{" "}
                                {translate("ai.of_goal")})
                              </span>
                            </span>
                          </div>
                          <div className="h-3 w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              style={{
                                width: `${Math.min(100, ((savingsGoal.currentSavings || 0) / savingsGoal.amount) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">{translate("ai.of_income")}</span>
                          <span className="font-medium">{savingsGoal.savingsRate.toFixed(1)}%</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">{translate("ai.goal_timeline")}</span>
                          <span className="font-medium">6 {translate("ai.months")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {savingsGoal.potentialSavings && savingsGoal.potentialSavings.length > 0 && (
                  <div className="bg-white dark:bg-gray-800/60 p-5 rounded-xl shadow-md border border-emerald-100/50 dark:border-emerald-900/10">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <LightbulbIcon className="h-5 w-5 text-amber-500" />
                      {translate("ai.potential_savings")}
                    </h3>

                    <div className="space-y-4">
                      {savingsGoal.potentialSavings.map((saving, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-lg border border-emerald-100/50 dark:border-emerald-900/20"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{translate(`category.${saving.category}`)}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatCurrency(saving.amount)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{saving.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorize">
            <AutoCategorize />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

