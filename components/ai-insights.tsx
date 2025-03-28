"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Brain,
  BarChart3,
  PieChart,
  LineChart,
  LightbulbIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  CoinsIcon,
  WalletIcon,
  CreditCardIcon,
  HeartIcon,
  ShieldIcon,
  BrainCircuitIcon,
} from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useFinance } from "@/context/finance-context"
import { generateFinancialInsights } from "@/utils/ai-predictions"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AIInsights() {
  const { translate, formatCurrency } = useSettings()
  const { state } = useFinance()
  const [activeTab, setActiveTab] = useState("insights")
  const [insights, setInsights] = useState<{
    insights: string[]
    spendingTrends: { category: string; trend: "increasing" | "decreasing" | "stable"; percentage: number }[]
    topExpenseCategories: { category: string; percentage: number; amount: number }[]
  } | null>(null)

  // Financial tips based on user data
  const [financialTips, setFinancialTips] = useState<
    {
      title: string
      description: string
      icon: React.ReactNode
      action?: string
      color: string
    }[]
  >([])

  useEffect(() => {
    // Generar insights cuando cambian las transacciones
    if (state.transactions.length > 0) {
      const generatedInsights = generateFinancialInsights(state.transactions)
      setInsights(generatedInsights)

      // Generate financial tips based on insights
      generateFinancialTips(generatedInsights)
    }
  }, [state.transactions])

  // Generate financial tips based on insights
  const generateFinancialTips = (insightData: any) => {
    const tips = []

    // Check if there's a high expense category
    if (insightData.topExpenseCategories.length > 0) {
      const topCategory = insightData.topExpenseCategories[0]
      if (topCategory.percentage > 40) {
        tips.push({
          title: translate("tips.diversify_spending"),
          description: translate("tips.diversify_spending_desc").replace(
            "{category}",
            translate(`category.${topCategory.category}`),
          ),
          icon: <PieChart className="h-5 w-5" />,
          action: translate("tips.create_budget"),
          color: "from-indigo-500 to-purple-500",
        })
      }
    }

    // Calculate savings rate
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
    const savingsRate = currentMonthIncome > 0 ? (currentSavings / currentMonthIncome) * 100 : 0

    // Consejo sobre inversiones si hay buenos ahorros
    if (savingsRate > 15) {
      tips.push({
        title: translate("tips.investment_opportunity"),
        description: translate("tips.investment_opportunity_desc"),
        icon: <TrendingUp className="h-5 w-5" />,
        action: translate("tips.explore_investments"),
        color: "from-emerald-500 to-green-500",
      })
    }

    // Consejo sobre fondo de emergencia
    tips.push({
      title: translate("tips.emergency_fund"),
      description: translate("tips.emergency_fund_desc"),
      icon: <ShieldIcon className="h-5 w-5" />,
      action: translate("tips.start_saving"),
      color: "from-amber-500 to-yellow-500",
    })

    // Consejo sobre automatizar ahorros
    tips.push({
      title: translate("tips.automate_savings"),
      description: translate("tips.automate_savings_desc"),
      icon: <CoinsIcon className="h-5 w-5" />,
      action: translate("tips.set_up_auto"),
      color: "from-blue-500 to-cyan-500",
    })

    // Consejo sobre reducir deudas
    tips.push({
      title: translate("tips.reduce_debt"),
      description: translate("tips.reduce_debt_desc"),
      icon: <CreditCardIcon className="h-5 w-5" />,
      action: translate("tips.debt_strategy"),
      color: "from-rose-500 to-pink-500",
    })

    setFinancialTips(tips)
  }

  // Translate insight keys to readable text
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

  // Get icon for insight
  const getInsightIcon = (insightKey: string) => {
    if (!insightKey.includes("|")) return <Brain className="h-5 w-5" />

    const [key] = insightKey.split("|")

    switch (key) {
      case "insight.top_category":
        return <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case "insight.increasing_trend":
        return <TrendingUp className="h-5 w-5 text-rose-600 dark:text-rose-400" />
      case "insight.decreasing_trend":
        return <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      case "insight.excellent_savings":
      case "insight.good_savings":
        return <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      case "insight.negative_savings":
        return <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
      default:
        return <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
    }
  }

  // Get background color for insight
  const getInsightBackground = (insightKey: string) => {
    if (!insightKey.includes("|"))
      return "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-100 dark:border-purple-900/20"

    const [key] = insightKey.split("|")

    switch (key) {
      case "insight.increasing_trend":
        return "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-rose-100 dark:border-rose-900/20"
      case "insight.decreasing_trend":
        return "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border-emerald-100 dark:border-emerald-900/20"
      case "insight.excellent_savings":
      case "insight.good_savings":
        return "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-100 dark:border-emerald-900/20"
      case "insight.negative_savings":
        return "bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/10 dark:to-red-900/10 border-rose-100 dark:border-rose-900/20"
      default:
        return "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-100 dark:border-purple-900/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="mr-3 p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 text-transparent bg-clip-text">
            {translate("ai.title")}
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50 transition-all">
            <ArrowLeftIcon className="h-4 w-4" />
            {translate("dashboard.back")}
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="insights" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6 bg-muted/50 p-1 dark:bg-muted/20 rounded-xl">
          <TabsTrigger
            value="insights"
            className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
          >
            <Brain className="h-4 w-4" />
            {translate("ai.insights")}
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            {translate("ai.predictions")}
          </TabsTrigger>
          <TabsTrigger
            value="anomalies"
            className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
          >
            <AlertTriangle className="h-4 w-4" />
            {translate("ai.anomalies")}
          </TabsTrigger>
          <TabsTrigger
            value="savings"
            className="flex items-center gap-2 data-[state=active]:bg-background rounded-lg data-[state=active]:shadow-sm transition-all"
          >
            <Target className="h-4 w-4" />
            {translate("ai.savings")}
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
              {insights ? (
                <>
                  {/* Key Insights */}
                  <div className="space-y-4">
                    {insights.insights.map((insight, index) => {
                      // Determinar el color de fondo basado en el tipo de insight
                      let bgGradient = "from-purple-500/10 to-indigo-500/10"
                      let iconBg = "bg-purple-100 dark:bg-purple-900/30"
                      let iconColor = "text-purple-600 dark:text-purple-400"

                      if (insight.includes("insight.increasing_trend")) {
                        bgGradient = "from-rose-500/10 to-pink-500/10"
                        \
                        iconBg = "bg-rose-100  {
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
                                <PieChart className={`h-5 w-5 ${iconColor}`} />
                              )}
                              {insight.includes("insight.increasing_trend") && (
                                <TrendingUp className={`h-5 w-5 ${iconColor}`} />
                              )}
                              {insight.includes("insight.decreasing_trend") && (
                                <TrendingUp className={`h-5 w-5 ${iconColor}`} />
                              )}
                              {insight.includes("insight.excellent_savings") && (
                                <Target className={`h-5 w-5 ${iconColor}`} />
                              )}
                              {insight.includes("insight.good_savings") && (
                                <WalletIcon className={`h-5 w-5 ${iconColor}`} />
                              )}
                              {insight.includes("insight.negative_savings") && (
                                <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
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

                  {/* Financial Tips */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-5 text-gray-800 dark:text-gray-100">
                      <HeartIcon className="h-6 w-6 text-rose-500" />
                      {translate("tips.financial_tips")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {financialTips.map((tip, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800/60 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700/30 hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden relative"
                        >
                          <div
                            className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tip.color} opacity-10 rounded-full -mr-8 -mt-8`}
                          ></div>
                          <div className="flex items-start gap-4">
                            <div className={`rounded-full bg-gradient-to-r ${tip.color} p-3 shadow-md`}>{tip.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-lg text-gray-900 dark:text-gray-100">{tip.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{tip.description}</p>
                              {tip.action && (
                                <div className="mt-3">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                                  >
                                    {tip.action}
                                    <ChevronRightIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Spending Trends */}
                    {insights.spendingTrends.length > 0 && (
                      <Card className="shadow-md border-0 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-900/10 dark:to-indigo-900/10 pb-3 border-b border-purple-100/50 dark:border-purple-900/10">
                          <CardTitle className="text-base font-medium flex items-center gap-2">
                            <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                            <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                </>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-6"></div>
                    <p className="text-base text-slate-600 dark:text-slate-300">{translate("ai.analyzing_data")}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{translate("ai.please_wait")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/5 dark:to-indigo-900/5 overflow-hidden">
            <CardHeader className="border-b border-blue-100/50 dark:border-blue-900/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>{translate("ai.future_predictions")}</CardTitle>
                  <CardDescription>{translate("ai.based_on_history")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                    <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {translate("ai.predicted_expenses")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {translate("ai.based_on_history")}
                    </p>

                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("dashboard.this_month")}</span>
                          <span className="font-medium">{formatCurrency(1250)}</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("ai.next_month")}</span>
                          <span className="font-medium">{formatCurrency(1180)}</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          5% {translate("ai.decrease_from_last")}
                        </Badge>

                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {translate("ai.prediction_confidence")}:
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            {translate("ai.high_confidence")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {translate("ai.predicted_income")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {translate("ai.next_months_forecast")}
                    </p>

                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("dashboard.this_month")}</span>
                          <span className="font-medium">{formatCurrency(2800)}</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("ai.next_month")}</span>
                          <span className="font-medium">{formatCurrency(2800)}</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {translate("ai.stable")}
                        </Badge>

                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {translate("ai.prediction_confidence")}:
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            {translate("ai.high_confidence")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                    <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {translate("ai.predicted_categories")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{translate("ai.next_month")}</p>

                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("category.housing")}</span>
                          <span className="font-medium">{formatCurrency(450)}</span>
                        </div>
                        <Progress value={38} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("category.food")}</span>
                          <span className="font-medium">{formatCurrency(320)}</span>
                        </div>
                        <Progress value={27} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("category.transportation")}</span>
                          <span className="font-medium">{formatCurrency(180)}</span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("category.entertainment")}</span>
                          <span className="font-medium">{formatCurrency(150)}</span>
                        </div>
                        <Progress value={13} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5 overflow-hidden">
            <CardHeader className="border-b border-amber-100/50 dark:border-amber-900/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle>{translate("ai.spending_anomalies")}</CardTitle>
                  <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{translate("category.food")}</h3>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                      >
                        +35% {translate("ai.increase_from_last")}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("ai.average_spending")}</span>
                          <span className="font-medium">{formatCurrency(240)}</span>
                        </div>
                        <Progress value={60} className="h-2 bg-slate-200 dark:bg-slate-700" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("ai.current_spending")}</span>
                          <span className="font-medium text-amber-600 dark:text-amber-400">{formatCurrency(325)}</span>
                        </div>
                        <Progress value={81} className="h-2 bg-slate-200 dark:bg-slate-700" />
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                        {translate("anomaly.food_explanation")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {translate("anomaly.additional_income")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {translate("anomaly.income_explanation")}
                    </p>

                    <div className="mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("anomaly.amount")}</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(350)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {translate("anomaly.unused_subscription")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {translate("anomaly.subscription_explanation")}
                    </p>

                    <div className="mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("anomaly.monthly_cost")}</span>
                        <span className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(12.99)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm">{translate("anomaly.last_used")}</span>
                        <span className="font-medium">3 {translate("anomaly.months_ago")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/5 dark:to-teal-900/5 overflow-hidden">
            <CardHeader className="border-b border-emerald-100/50 dark:border-emerald-900/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle>{translate("ai.savings_goal")}</CardTitle>
                  <CardDescription>{translate("ai.savings_recommendation")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{translate("ai.savings_goal")}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {translate("ai.savings_recommendation")}
                    </p>

                    <div className="mt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("ai.recommended_amount")}</span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">{formatCurrency(500)}</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{translate("ai.current_savings")}</span>
                          <span className="font-medium">€350 (70% {translate("ai.of_goal")})</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("ai.of_income")}</span>
                        <span className="font-medium">17.8%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("ai.goal_timeline")}</span>
                        <span className="font-medium">6 {translate("ai.months")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-900/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {translate("ai.budget_optimization")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {translate("ai.budget_explanation")}
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("category.entertainment")}</span>
                        <div className="flex items-center">
                          <span className="font-medium text-rose-600 dark:text-rose-400 mr-1">-15%</span>
                          <span className="font-medium">= {formatCurrency(75)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("category.food")}</span>
                        <div className="flex items-center">
                          <span className="font-medium text-rose-600 dark:text-rose-400 mr-1">-10%</span>
                          <span className="font-medium">= {formatCurrency(50)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">{translate("category.shopping")}</span>
                        <div className="flex items-center">
                          <span className="font-medium text-rose-600 dark:text-rose-400 mr-1">-20%</span>
                          <span className="font-medium">= {formatCurrency(60)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

